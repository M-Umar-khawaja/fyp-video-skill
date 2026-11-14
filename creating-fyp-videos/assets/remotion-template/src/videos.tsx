/**
 * One entry per video. Each becomes two compositions in the Studio:
 *   <name> (captions burned in) and <name>Clean (no captions).
 * `id` must match a key in src/data/timeline.json (written by scripts/build_timeline.mjs).
 */
import timeline from './data/timeline.json';
import type {SceneComp, Sfx, Timeline} from './components/Stage';
import {S01, S02, S03, S04} from './scenes/Demo';

export type VideoDef = {
  id: string;
  name: string; // composition name: letters, numbers, hyphens
  scenes: Record<string, SceneComp>;
  sfx?: (cues: Record<string, number>) => Sfx[];
  noFade?: string[];
  musicLevel?: (t: number, speaking: boolean) => number;
};

export const TIMELINES = timeline as unknown as Record<string, Timeline>;

export const VIDEOS: VideoDef[] = [
  {
    id: 'demo',
    name: 'Demo',
    scenes: {S01, S02, S03, S04},
    sfx: (c) => [
      {at: c.title - 0.1, name: 'motif', vol: 0.3},
      {at: c.token, name: 'whoosh', vol: 0.15},
      {at: c.result, name: 'ok', vol: 0.25},
      {at: c.ours, name: 'tick', vol: 0.2},
    ],
  },
];
