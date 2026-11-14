import {loadFont as loadTitle} from '@remotion/google-fonts/ArchivoNarrow';
import {loadFont as loadBody} from '@remotion/google-fonts/SourceSans3';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';

/**
 * Design tokens. Replace these with the project's own poster/report identity
 * (colours, fonts) before drawing any scene. Give each accent ONE meaning and keep it.
 */
export const C = {
  // backgrounds and ink
  night: '#0B2943', // dark state: stakes, title, end card
  night2: '#123A5E',
  paper: '#F7F9FC', // light state: diagrams
  ink: '#0B2943',
  ink2: '#4A6178',
  mute: '#8A9BAD',
  white: '#FFFFFF',
  onNight: '#E8EEF4',
  onNight2: '#A9C0D4',
  // accents (example meanings; rename to your project's)
  a: '#116C69', // accent A (e.g. data path / scheme A) on paper
  aL: '#3FBFB0', // accent A on night
  aBg: '#E4F2F0',
  b: '#304F9B', // accent B (e.g. control path / scheme B)
  bL: '#7FA2E8',
  bBg: '#E7EDF8',
  target: '#A86214', // targets / estimates / planned ONLY
  targetL: '#E8B04A',
  targetBg: '#FBEBCB',
  ok: '#2E9E5B',
  bad: '#B33A3A', // failure / tamper only, use sparingly
};

// Google Fonts load at render time (needs internet). For offline work, put .woff2 files in
// public/fonts and load them with FontFace + staticFile instead (see references/remotion-build.md).
const title = loadTitle('normal', {weights: ['700'], subsets: ['latin']});
const body = loadBody('normal', {weights: ['400', '600'], subsets: ['latin']});
const mono = loadMono('normal', {weights: ['400', '700'], subsets: ['latin']});

export const F = {
  title: title.fontFamily, // titles, block names
  body: body.fontFamily, // labels, captions
  mono: mono.fontFamily, // numbers, bits, code
  word: title.fontFamily, // project wordmark (swap for the poster's display face)
};
