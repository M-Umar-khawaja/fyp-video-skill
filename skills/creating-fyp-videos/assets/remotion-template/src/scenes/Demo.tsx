/**
 * Example scenes showing the patterns. Replace them with the project's own scenes,
 * one component per storyboard scene. Every time comes from a cue (cue(c, 'name')),
 * never from a hand-typed second, so the picture stays on the word when takes change.
 */
import React from 'react';
import {C, F} from '../lib/theme';
import {EIO, POP, Pt, camAt, camT, clamp, cue, pointAt, pr, useT} from '../lib/anim';
import {Bar, Box, CheckG, Counter, Kicker, Night, Paper, StepChip, Tag, Tile, Txt, Wire, Wordmark} from '../components/kit';
import type {SceneDef} from '../components/Stage';

/* S01 · Title reveal on the dark state */
export const S01: React.FC<{s: SceneDef}> = () => {
  const {t, cues: c} = useT();
  const stats = [
    {to: 500, unit: 'MHz', label: 'clock target', color: C.targetL, at: cue(c, 'stats')},
    {to: 18, unit: '', label: 'operating modes', color: C.white, at: cue(c, 'stats') + 0.3},
    {to: 64, unit: 'KiB', label: 'shared memory', color: C.white, at: cue(c, 'stats') + 0.6},
  ];
  return (
    <g>
      <Night />
      <Wordmark x={180} y={470} text="PROJECT" accent="–X" size={150} p={pr(t, cue(c, 'title') - 0.2, 1.0)} />
      <g opacity={pr(t, cue(c, 'tagline') - 0.1, 0.6)} transform={`translate(0 ${(1 - pr(t, cue(c, 'tagline') - 0.1, 0.6)) * 12})`}>
        <Txt x={186} y={560} size={44} w={400} color={C.onNight}>One-line tagline from the poster header</Txt>
      </g>
      {stats.map((s, i) => (
        <g key={i}>
          <Counter x={186 + i * 440} y={720} to={s.to} p={pr(t, s.at, 0.9)} size={72} color={s.color} unit={s.unit} />
          <Txt x={186 + i * 440} y={770} size={28} w={400} color={C.onNight2} op={pr(t, s.at + 0.3, 0.5)}>{s.label}</Txt>
        </g>
      ))}
    </g>
  );
};

/* S02 · Architecture walkthrough: camera, wires that draw themselves, a token on the real path */
// tokens ride the wires between blocks (real geometry), never across a block's face
const IN_PATH: Pt[] = [[400, 540], [760, 540]];
const OUT_PATH: Pt[] = [[1160, 540], [1440, 540]];
export const S02: React.FC<{s: SceneDef}> = ({s}) => {
  const {t, cues: c} = useT();
  const cam = camAt(t, {x: 960, y: 540, z: 1}, [
    {at: cue(c, 'input') - 0.2, dur: 1.1, x: 560, y: 540, z: 1.25},
    {at: cue(c, 'process') - 0.2, dur: 1.1, x: 960, y: 540, z: 1.25},
    {at: cue(c, 'output') - 0.2, dur: 1.1, x: 1360, y: 540, z: 1.25},
    {at: cue(c, 'result') - 0.3, dur: 1.2, x: 960, y: 540, z: 1},
  ]);
  const m1 = clamp((t - cue(c, 'process')) / 1.0);
  const m2 = clamp((t - cue(c, 'token')) / 1.0);
  const [ax, ay] = pointAt(IN_PATH, EIO(m1));
  const [bx, by] = pointAt(OUT_PATH, EIO(m2));
  const hl = (a: number, b: number) => pr(t, a, 0.35) * (1 - pr(t, b, 0.5));
  const done = pr(t, cue(c, 'result'), 0.5, POP);
  return (
    <g>
      <Paper />
      <g transform={camT(cam)}>
        <Wire pts={[[400, 540], [760, 540]]} draw={pr(t, cue(c, 'process') - 0.4, 0.6)} />
        <Wire pts={[[1160, 540], [1520, 540]]} draw={pr(t, cue(c, 'output') - 0.4, 0.6)} />
        <Box x={200} y={440} w={280} h={200} label="Input" sub="sensor / user / data" draw={pr(t, s.start + 0.2, 0.8)} hl={hl(cue(c, 'input'), cue(c, 'process'))} />
        <Box x={760} y={420} w={400} h={240} label="Core idea" sub="the project's key block" draw={pr(t, cue(c, 'process') - 0.2, 0.8)} hl={hl(cue(c, 'process'), cue(c, 'output'))} />
        <Box x={1440} y={440} w={280} h={200} label="Output" sub="result / decision" draw={pr(t, cue(c, 'output') - 0.2, 0.8)} hl={hl(cue(c, 'output'), cue(c, 'result')) + done} hlc={C.ok} />
        {m1 > 0 && m1 < 1 && <Tile x={ax} y={ay} label="sample" />}
        {m2 > 0 && m2 < 1 && <Tile x={bx} y={by} label="result" color={C.ok} />}
        <CheckG x={1580} y={420} s={1.1} p={done} op={done} />
      </g>
      <StepChip n={1} text="Input arrives" op={hl(cue(c, 'input'), cue(c, 'process') - 0.1)} />
      <StepChip n={2} text="The core block transforms it" op={hl(cue(c, 'process'), cue(c, 'output') - 0.1)} />
      <StepChip n={3} text="A verified result comes out" op={hl(cue(c, 'output'), s.end - 0.5)} color={C.ok} />
    </g>
  );
};

/* S03 · Results with an explicit status tag: never show a number without its status */
export const S03: React.FC<{s: SceneDef}> = ({s}) => {
  const {t, cues: c} = useT();
  return (
    <g>
      <Paper />
      <Txt x={200} y={230} size={60} fam={F.title} op={pr(t, s.start + 0.1, 0.5)}>Latency per operation</Txt>
      <Tag x={200} y={300} text="Proposal estimate · µs" op={pr(t, s.start + 0.3, 0.5)} />
      <Bar x={480} y={430} len={1100} p={pr(t, cue(c, 'baseline'), 1.0)} color={C.ink2} label="Software baseline" value="118 µs" />
      <Bar x={480} y={530} len={88} p={pr(t, cue(c, 'ours'), 0.8)} color={C.a} label="This project" value="9.3 µs" />
      <g opacity={pr(t, cue(c, 'counter'), 0.4)}>
        <Counter x={1500} y={760} to={12.7} decimals={1} p={pr(t, cue(c, 'counter'), 1.0)} size={110} color={C.a} unit="× faster" anchor="end" />
      </g>
    </g>
  );
};

/* S04 · End card: name, team, supervisors, institution (replace with real logos via <Logo/>) */
export const S04: React.FC<{s: SceneDef}> = ({s}) => {
  const {t, cues: c} = useT();
  const f = (k: number) => pr(t, s.start + 0.2 + k * 0.15, 0.6);
  return (
    <g>
      <Night />
      <Wordmark x={140} y={420} text="PROJECT" accent="–X" size={120} p={pr(t, s.start + 0.1, 0.9)} />
      <g opacity={f(2)}>
        <Txt x={144} y={510} size={38} w={400} color={C.onNight}>One-line tagline from the poster header</Txt>
      </g>
      <g opacity={pr(t, cue(c, 'team') - 0.2, 0.6)}>
        <rect x={1140} y={240} width={640} height={330} rx={20} fill={C.white} />
        <Txt x={1176} y={300} size={26} w={700} fam={F.title}>University · Department</Txt>
        <Txt x={1176} y={350} size={22} w={400} color={C.ink2}>[university and partner logos here]</Txt>
        <Txt x={1176} y={450} size={24} w={400} color={C.ink2}>Supervisor</Txt>
        <Txt x={1360} y={450} size={24} w={600}>Dr. Name Surname</Txt>
        <Txt x={1176} y={500} size={24} w={400} color={C.ink2}>Team</Txt>
        <Txt x={1360} y={500} size={24} w={600}>Student One · Student Two</Txt>
      </g>
      <Kicker x={1780} y={1040} size={16} color={C.onNight2} anchor="end" op={f(4)}>Voice: Gemini TTS · original music</Kicker>
    </g>
  );
};
