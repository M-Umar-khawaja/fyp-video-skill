import {createContext, useContext} from 'react';
import {Easing} from 'remotion';

/** Entrances: expo-out. */
export const EO = Easing.bezier(0.22, 1, 0.36, 1);
/** Camera moves and large repositioning: ease-in-out. */
export const EIO = Easing.bezier(0.65, 0, 0.35, 1);
/** Small overshoot: only for small "pop" objects (ticks, badges, keys). */
export const POP = Easing.bezier(0.34, 1.56, 0.64, 1);

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Eased progress 0→1 of an animation that starts at time s (seconds) and lasts d seconds. */
export const pr = (t: number, s: number, d = 0.6, e: (x: number) => number = EO) => e(clamp((t - s) / d));

/** Visible between s and e with fades in and out. */
export const win = (t: number, s: number, e: number, fi = 0.4, fo = 0.4) =>
  Math.min(EO(clamp((t - s) / fi)), EO(clamp((e - t) / fo)));

export type Pt = [number, number];

export const polyLen = (pts: Pt[]) => {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
};

/** Point at fraction p (0..1) of a polyline's length: moves tokens along real wire geometry. */
export const pointAt = (pts: Pt[], p: number): Pt => {
  const L = polyLen(pts) * clamp(p);
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + seg >= L) {
      const q = seg === 0 ? 0 : (L - acc) / seg;
      return [lerp(pts[i - 1][0], pts[i][0], q), lerp(pts[i - 1][1], pts[i][1], q)];
    }
    acc += seg;
  }
  return pts[pts.length - 1];
};

/** Orthogonal polyline with rounded corners as an SVG path. */
export const ptsToD = (pts: Pt[], r = 10) => {
  if (pts.length < 3) return `M${pts.map((p) => p.join(' ')).join(' L')}`;
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1], [cx, cy] = pts[i], [nx, ny] = pts[i + 1];
    const l1 = Math.hypot(cx - px, cy - py), l2 = Math.hypot(nx - cx, ny - cy);
    const rr = Math.min(r, l1 / 2, l2 / 2);
    const ax = cx - ((cx - px) / l1) * rr, ay = cy - ((cy - py) / l1) * rr;
    const bx = cx + ((nx - cx) / l2) * rr, by = cy + ((ny - cy) / l2) * rr;
    d += ` L${ax} ${ay} Q${cx} ${cy} ${bx} ${by}`;
  }
  const last = pts[pts.length - 1];
  return d + ` L${last[0]} ${last[1]}`;
};

/** Virtual camera over a large canvas: keys are applied in order, each easing from the previous state. */
export type Cam = {x: number; y: number; z: number};
export type CamKey = Cam & {at: number; dur: number};
export const camAt = (t: number, init: Cam, keys: CamKey[]): Cam => {
  let cur = {...init};
  for (const k of keys) {
    const p = pr(t, k.at, k.dur, EIO);
    if (p <= 0) break;
    cur = {x: lerp(cur.x, k.x, p), y: lerp(cur.y, k.y, p), z: cur.z * Math.pow(k.z / cur.z, p)};
  }
  return cur;
};
/** SVG transform that centres camera position (x, y) at zoom z on a 1920x1080 frame. */
export const camT = (c: Cam) => `translate(960 540) scale(${c.z}) translate(${-c.x} ${-c.y})`;

export type Cues = Record<string, number>;
export type Ctx = {t: number; cues: Cues; frame: number};
export const TimeCtx = createContext<Ctx>({t: 0, cues: {}, frame: 0});
/** t = current time in seconds; cues = named times (seconds) anchored to spoken words. */
export const useT = () => useContext(TimeCtx);

/** Read a cue, failing loudly so a typo never silently becomes time 0. */
export const cue = (cues: Cues, name: string): number => {
  const v = cues[name];
  if (v === undefined) throw new Error(`Unknown cue "${name}". Known cues: ${Object.keys(cues).join(', ')}`);
  return v;
};
