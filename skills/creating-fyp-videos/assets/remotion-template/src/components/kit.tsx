/**
 * Drawing kit: one consistent line style for every scene.
 * All components render SVG inside a 1920x1080 viewBox (see Stage.tsx).
 * Animate them by passing progress values computed from cues (pr(t, cue, dur)).
 */
import React, {useId} from 'react';
import {Img, staticFile} from 'remotion';
import {C, F} from '../lib/theme';
import {Pt, clamp, ptsToD, useT} from '../lib/anim';

const useSid = () => useId().replace(/[^a-zA-Z0-9]/g, '');

export const mix = (a: string, b: string, p: number) => {
  const ch = (s: string) => {
    const v = parseInt(s.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  };
  const A = ch(a), B = ch(b);
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * clamp(p)).toString(16).padStart(2, '0')).join('')}`;
};

/* ------------------------------------------------------------------ backgrounds */

/** Dark state with a soft radial gradient and very faint film grain. */
export const Night: React.FC<{grain?: boolean}> = ({grain = true}) => {
  const id = useSid();
  const {frame} = useT();
  return (
    <g>
      <defs>
        <radialGradient id={`g${id}`} cx="45%" cy="40%" r="75%">
          <stop offset="0" stopColor={C.night2} />
          <stop offset="1" stopColor={C.night} />
        </radialGradient>
        <filter id={`n${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 7} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      <rect width={1920} height={1080} fill={`url(#g${id})`} />
      {grain && <rect width={1920} height={1080} filter={`url(#n${id})`} opacity={0.05} style={{mixBlendMode: 'overlay'}} />}
    </g>
  );
};

/** Light "blueprint" state with a faint 24 px / 120 px grid. */
export const Paper: React.FC<{grid?: number}> = ({grid = 1}) => {
  const id = useSid();
  return (
    <g>
      <defs>
        <pattern id={`p${id}`} width={24} height={24} patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke={C.ink} strokeOpacity={0.045} strokeWidth={1} />
        </pattern>
        <pattern id={`q${id}`} width={120} height={120} patternUnits="userSpaceOnUse">
          <path d="M120 0H0V120" fill="none" stroke={C.ink} strokeOpacity={0.06} strokeWidth={1} />
        </pattern>
      </defs>
      <rect width={1920} height={1080} fill={C.paper} />
      <g opacity={grid}>
        <rect width={1920} height={1080} fill={`url(#p${id})`} />
        <rect width={1920} height={1080} fill={`url(#q${id})`} />
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ text */
type TxtProps = {
  x: number; y: number; size?: number; w?: number | string; fam?: string; color?: string;
  anchor?: 'start' | 'middle' | 'end'; op?: number; ls?: number; mid?: boolean; italic?: boolean; caps?: boolean;
  children: React.ReactNode;
};
export const Txt: React.FC<TxtProps> = ({x, y, size = 30, w = 600, fam = F.body, color = C.ink, anchor = 'start', op = 1, ls = 0, mid, italic, caps, children}) => (
  <text
    x={x} y={y} fontSize={size} fontWeight={w} fontFamily={fam} fill={color} textAnchor={anchor} opacity={op}
    letterSpacing={ls} dominantBaseline={mid ? 'central' : 'alphabetic'} fontStyle={italic ? 'italic' : 'normal'}
    style={caps ? {textTransform: 'uppercase'} : undefined}
  >
    {children}
  </text>
);

/** Small spaced-caps section label. */
export const Kicker: React.FC<{x: number; y: number; color?: string; op?: number; anchor?: 'start' | 'middle' | 'end'; size?: number; children: React.ReactNode}> = ({x, y, color = C.ink2, op = 1, anchor = 'start', size = 24, children}) => (
  <Txt x={x} y={y} size={size} w={600} color={color} op={op} anchor={anchor} ls={4} caps>
    {children}
  </Txt>
);

/** Pill tag, e.g. a status label: "Target", "Measured", "Planned". */
export const Tag: React.FC<{x: number; y: number; text: string; color?: string; bg?: string; size?: number; op?: number; anchor?: 'start' | 'middle'; w?: number}> = ({x, y, text, color = C.target, bg = C.targetBg, size = 24, op = 1, anchor = 'start', w}) => {
  const width = w ?? text.length * size * 0.55 + 34;
  const x0 = anchor === 'middle' ? x - width / 2 : x;
  return (
    <g opacity={op}>
      <rect x={x0} y={y - size * 0.95} width={width} height={size * 1.6} rx={size * 0.8} fill={bg} />
      <Txt x={x0 + width / 2} y={y - size * 0.15} size={size} w={600} color={color} anchor="middle" mid>
        {text}
      </Txt>
    </g>
  );
};

/* ------------------------------------------------------------------ boxes, wires, tokens */
type BoxProps = {
  x: number; y: number; w: number; h: number; r?: number; fill?: string; stroke?: string; sw?: number;
  /** 0→1: the outline draws itself, then the label fades in */
  draw?: number;
  label?: string; sub?: string; ls?: number; ss?: number; lc?: string; sc?: string;
  align?: 'center' | 'left';
  /** 0→1 highlight ring in colour hlc */
  hl?: number; hlc?: string; op?: number; fam?: string; children?: React.ReactNode;
};
export const Box: React.FC<BoxProps> = ({
  x, y, w, h, r = 14, fill = C.white, stroke = C.ink, sw = 3, draw = 1, label, sub, ls = 32, ss = 22, lc = C.ink, sc = C.ink2,
  align = 'center', hl = 0, hlc = C.a, op = 1, fam = F.title, children,
}) => {
  const d = clamp(draw);
  const lx = align === 'left' ? x + 24 : x + w / 2;
  const anchor = align === 'left' ? 'start' : 'middle';
  const ly = align === 'center' ? y + h / 2 + (sub ? -ss * 0.55 : 0) : y + ls + 14;
  return (
    <g opacity={op}>
      {hl > 0 && <rect x={x - 7} y={y - 7} width={w + 14} height={h + 14} rx={r + 7} fill="none" stroke={hlc} strokeWidth={6} opacity={0.35 * hl} />}
      <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} opacity={clamp(d * 1.6)} />
      <rect
        x={x} y={y} width={w} height={h} rx={r} fill="none" stroke={hl > 0 ? mix(stroke, hlc, hl) : stroke}
        strokeWidth={sw + hl * 1.5} pathLength={1} strokeDasharray={d >= 1 ? undefined : `${d} 1`}
      />
      <g opacity={clamp((d - 0.4) / 0.6)}>
        {label && (
          <Txt x={lx} y={ly} size={ls} fam={fam} w={700} color={lc} anchor={anchor} mid={align === 'center'}>
            {label}
          </Txt>
        )}
        {sub && (
          <Txt x={lx} y={align === 'center' ? y + h / 2 + ls * 0.62 : ly + ss + 10} size={ss} w={400} color={sc} anchor={anchor} mid={align === 'center'}>
            {sub}
          </Txt>
        )}
        {children}
      </g>
    </g>
  );
};

type WireProps = {pts: Pt[]; draw?: number; dashed?: boolean; color?: string; w?: number; arrow?: boolean | 'both'; op?: number; glow?: number; r?: number};
/** Wire along an orthogonal polyline. Convention: solid = data, dashed = control. */
export const Wire: React.FC<WireProps> = ({pts, draw = 1, dashed, color = C.a, w = 3.5, arrow = true, op = 1, glow = 0, r = 12}) => {
  const id = useSid();
  const d = ptsToD(pts, r);
  const dd = clamp(draw);
  if (dd <= 0) return null;
  const head = (a: Pt, b: Pt) => {
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const s = 9 + w;
    const p1: Pt = [b[0] - s * Math.cos(ang - 0.45), b[1] - s * Math.sin(ang - 0.45)];
    const p2: Pt = [b[0] - s * Math.cos(ang + 0.45), b[1] - s * Math.sin(ang + 0.45)];
    return `M${p1.join(' ')} L${b.join(' ')} L${p2.join(' ')} Z`;
  };
  const n = pts.length;
  return (
    <g opacity={op}>
      <defs>
        <mask id={`m${id}`} maskUnits="userSpaceOnUse" x={-4000} y={-4000} width={12000} height={12000}>
          <path d={d} fill="none" stroke="#fff" strokeWidth={w + 12} pathLength={1} strokeDasharray={`${dd} 1`} />
        </mask>
      </defs>
      {glow > 0 && <path d={d} fill="none" stroke={color} strokeWidth={w + 10} opacity={0.22 * glow} mask={`url(#m${id})`} strokeLinecap="round" />}
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeDasharray={dashed ? `${w * 3} ${w * 2.6}` : undefined} mask={`url(#m${id})`} strokeLinecap={dashed ? 'butt' : 'round'} />
      {arrow && dd > 0.97 && <path d={head(pts[n - 2], pts[n - 1])} fill={color} />}
      {arrow === 'both' && dd > 0.97 && <path d={head(pts[1], pts[0])} fill={color} />}
    </g>
  );
};

/** Labelled moving token (a packet, file, command…). Place with pointAt(path, progress). */
export const Tile: React.FC<{x: number; y: number; label: string; color?: string; bg?: string; size?: number; op?: number; w?: number}> = ({x, y, label, color = C.a, bg = C.white, size = 24, op = 1, w}) => {
  const width = w ?? label.length * size * 0.52 + 36;
  return (
    <g opacity={op} transform={`translate(${x} ${y})`}>
      <rect x={-width / 2 + 3} y={-size * 0.95 + 4} width={width} height={size * 1.9} rx={10} fill={C.ink} opacity={0.12} />
      <rect x={-width / 2} y={-size * 0.95} width={width} height={size * 1.9} rx={10} fill={bg} stroke={color} strokeWidth={3} />
      <Txt x={0} y={1} size={size} w={600} color={C.ink} anchor="middle" mid>
        {label}
      </Txt>
    </g>
  );
};

/** Numbered step chip (screen-space, top-left) for multi-step walkthroughs. */
export const StepChip: React.FC<{n: number; text: string; color?: string; op: number; dashed?: boolean}> = ({n, text, color = C.a, op, dashed}) => (
  <g opacity={op} transform={`translate(0 ${(1 - op) * -10})`}>
    <rect x={96} y={70} width={text.length * 15.5 + 190} height={64} rx={14} fill={C.white} stroke="#D5DEE8" strokeWidth={2} />
    <circle cx={132} cy={102} r={18} fill={color} />
    <Txt x={132} y={103} size={22} w={600} color={C.white} anchor="middle" mid>{n}</Txt>
    <path d="M166 102 H216" stroke={color} strokeWidth={4} strokeDasharray={dashed ? '9 7' : undefined} />
    <Txt x={232} y={103} size={28} w={600} mid>{text}</Txt>
  </g>
);

/* ------------------------------------------------------------------ results */

/** Number that counts up and lands exactly on `to` at progress 1. */
export const Counter: React.FC<{x: number; y: number; to: number; p: number; decimals?: number; size?: number; color?: string; unit?: string; anchor?: 'start' | 'middle' | 'end'; fam?: string}> = ({x, y, to, p, decimals = 0, size = 72, color = C.ink, unit, anchor = 'start', fam = F.title}) => (
  <text x={x} y={y} fontFamily={fam} fontWeight={700} fontSize={size} fill={color} textAnchor={anchor} opacity={clamp(p * 4)}>
    {(to * clamp(p)).toFixed(decimals)}
    {unit && <tspan fontSize={size * 0.45} dx={8}>{unit}</tspan>}
  </text>
);

/** Horizontal bar for comparisons; grows with p. */
export const Bar: React.FC<{x: number; y: number; len: number; p: number; h?: number; color?: string; label: string; value: string; op?: number}> = ({x, y, len, p, h = 44, color = C.a, label, value, op = 1}) => (
  <g opacity={op}>
    <Txt x={x - 20} y={y + h / 2} size={28} anchor="end" mid>{label}</Txt>
    <rect x={x} y={y} width={Math.max(0.01, len * clamp(p))} height={h} rx={8} fill={color} />
    <Txt x={x + len * clamp(p) + 16} y={y + h / 2} size={28} w={700} color={color} mid op={clamp(p * 3 - 2)}>{value}</Txt>
  </g>
);

export const CheckG: React.FC<{x: number; y: number; s?: number; c?: string; p?: number; op?: number}> = ({x, y, s = 1, c = C.ok, p = 1, op = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <circle r={26} fill={c} />
    <path d="M-12 1 L-3 10 L13 -9" fill="none" stroke={C.white} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${clamp(p)} 1`} />
  </g>
);

export const CrossG: React.FC<{x: number; y: number; s?: number; c?: string; p?: number; op?: number}> = ({x, y, s = 1, c = C.bad, p = 1, op = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <circle r={26} fill={c} />
    <path d="M-10 -10 L10 10 M10 -10 L-10 10" fill="none" stroke={C.white} strokeWidth={5.5} strokeLinecap="round" pathLength={1} strokeDasharray={`${clamp(p)} 1`} />
  </g>
);

/* ------------------------------------------------------------------ brand */

/** Project wordmark with a left-to-right clip reveal (p: 0→1). No width guessing needed. */
export const Wordmark: React.FC<{x: number; y: number; text: string; accent?: string; size?: number; p?: number; color?: string; accentColor?: string}> = ({x, y, text, accent, size = 140, p = 1, color = C.white, accentColor = C.aL}) => {
  const id = useSid();
  const rise = (1 - (1 - Math.pow(1 - clamp(p), 3))) * 24;
  return (
    <g>
      <defs>
        <clipPath id={`c${id}`}>
          <rect x={x - 20} y={y - size * 1.2} width={(1960 - x) * clamp(p)} height={size * 1.6} />
        </clipPath>
      </defs>
      <g clipPath={`url(#c${id})`} transform={`translate(0 ${rise})`}>
        <text x={x} y={y} fontFamily={F.word} fontWeight={700} fontSize={size} fill={color} letterSpacing={-size * 0.01}>
          {text}
          {accent && <tspan fill={accentColor}>{accent}</tspan>}
        </text>
      </g>
    </g>
  );
};

/** Logo or image from public/ inside the SVG scene. Prefer SVG/PNG with transparent background. */
export const Logo: React.FC<{src: string; x: number; y: number; w: number; h: number; op?: number}> = ({src, x, y, w, h, op = 1}) => (
  <foreignObject x={x} y={y} width={w} height={h} opacity={op}>
    <Img src={staticFile(src)} style={{width: w, height: h, objectFit: 'contain'}} />
  </foreignObject>
);
