// Builds src/data/timeline.json and out/<video>.srt from video.spec.json + scripts/words.json.
// Every scene start and animation cue is anchored to a spoken phrase, so the picture lands
// on the word, and re-recording a take only needs: transcribe -> build_timeline.
//
// usage: node scripts/build_timeline.mjs [--spec video.spec.json]
//
// Anchor syntax:  "<take>: <phrase>"   e.g. "Pitch_P1: that's why"
//                 "<take>: <phrase> #2" second occurrence of the phrase in that take
// Phrases are matched on letters/digits only, so punctuation and case don't matter.
// If a phrase isn't found exactly (whisper mis-hearing), the closest match is used with a warning.
import fs from 'node:fs';
import path from 'node:path';
import {parseArgs, wavDuration} from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const specFile = path.resolve(args.spec ?? 'video.spec.json');
const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
const wordsFile = path.resolve('scripts/words.json');
if (!fs.existsSync(wordsFile)) {
  console.error('scripts/words.json not found. Run: node scripts/transcribe.mjs');
  process.exit(1);
}
const raw = JSON.parse(fs.readFileSync(wordsFile, 'utf8'));
const warnings = [];
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// ---------------------------------------------------------------- transcript -> words
// whisper tokens: a leading space starts a new word; other tokens continue the previous word.
const WORDS = {};
for (const [take, toks] of Object.entries(raw)) {
  const ws = [];
  for (const k of toks) {
    const n = norm(k.t);
    if (!n) continue;
    if (ws.length && !/^\s/.test(k.t)) {
      const w = ws[ws.length - 1];
      w.n += n;
      w.raw += k.t;
      w.e = k.e / 1000;
    } else ws.push({n, raw: k.t.trim(), s: k.s / 1000, e: k.e / 1000});
  }
  WORDS[take] = ws;
}

const lev = (a, b) => {
  if (a === b) return 0;
  const dp = Array.from({length: b.length + 1}, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
};
const sim = (a, b) => (a.length + b.length ? 1 - lev(a, b) / Math.max(a.length, b.length) : 1);

// ---------------------------------------------------------------- phrase anchors
function findPhrase(take, phrase, nth = 1) {
  const W = WORDS[take];
  if (!W) throw new Error(`Take "${take}" not in words.json. Known takes: ${Object.keys(WORDS).join(', ')}`);
  const target = norm(phrase);
  let seen = 0;
  for (let i = 0; i < W.length; i++) {
    let acc = '';
    for (let j = i; j < W.length && acc.length < target.length; j++) {
      acc += W[j].n;
      if (acc.startsWith(target) || target === acc) {
        if (++seen === nth) return {i, s: W[i].s};
        break;
      }
      if (!target.startsWith(acc)) break;
    }
  }
  // fuzzy fallback: best window of similar length
  let best = {score: 0, i: -1, text: ''};
  for (let i = 0; i < W.length; i++) {
    let acc = '', txt = [];
    for (let j = i; j < W.length && acc.length < target.length * 1.4; j++) {
      acc += W[j].n;
      txt.push(W[j].raw);
      const sc = sim(acc, target);
      if (sc > best.score) best = {score: sc, i, text: txt.join(' ')};
    }
  }
  if (best.score >= 0.7) {
    warnings.push(`"${take}: ${phrase}" not found exactly; using closest match "${best.text}" (similarity ${best.score.toFixed(2)})`);
    return {i: best.i, s: W[best.i].s};
  }
  const preview = W.map((w) => w.raw).join(' ');
  throw new Error(`Phrase "${phrase}" not found in take "${take}" (best similarity ${best.score.toFixed(2)} for "${best.text}").\nTranscript of ${take}:\n${preview}`);
}
const parseAnchor = (a) => {
  const m = /^\s*([^:]+?)\s*:\s*(.+?)\s*(?:#(\d+))?\s*$/.exec(a);
  if (!m) throw new Error(`Bad anchor "${a}". Use "<take>: <spoken phrase>" (optionally "#2" for a later occurrence).`);
  return {take: m[1], phrase: m[2], nth: m[3] ? +m[3] : 1};
};

// ---------------------------------------------------------------- caption alignment
// Needleman-Wunsch alignment of the caption words against the transcript words of one take.
// Robust to whisper mistakes: each caption starts at its first word that aligns to speech.
function alignCaptions(take, texts) {
  const W = WORDS[take];
  const S = [];
  texts.forEach((txt, ci) => txt.split(/\s+/).forEach((w) => norm(w) && S.push({n: norm(w), ci})));
  const n = S.length, m = W.length, GAP = 0.8;
  const D = Array.from({length: n + 1}, () => new Float64Array(m + 1));
  const B = Array.from({length: n + 1}, () => new Uint8Array(m + 1)); // 1 diag, 2 up (skip script), 3 left (skip transcript)
  for (let i = 1; i <= n; i++) (D[i][0] = i * GAP), (B[i][0] = 2);
  for (let j = 1; j <= m; j++) (D[0][j] = j * GAP), (B[0][j] = 3);
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++) {
      const d = D[i - 1][j - 1] + (1 - sim(S[i - 1].n, W[j - 1].n));
      const u = D[i - 1][j] + GAP, l = D[i][j - 1] + GAP;
      if (d <= u && d <= l) (D[i][j] = d), (B[i][j] = 1);
      else if (u <= l) (D[i][j] = u), (B[i][j] = 2);
      else (D[i][j] = l), (B[i][j] = 3);
    }
  const map = new Array(n).fill(-1);
  for (let i = n, j = m; i > 0 || j > 0; ) {
    const b = B[i][j];
    if (b === 1) (map[i - 1] = j - 1), i--, j--;
    else if (b === 2) i--;
    else j--;
  }
  return texts.map((text, ci) => {
    const idx = S.map((s, k) => (s.ci === ci ? map[k] : -1)).filter((k) => k >= 0);
    if (!idx.length) {
      warnings.push(`Caption not found in ${take}: "${text}"`);
      return null;
    }
    return {text, i0: Math.min(...idx), i1: Math.max(...idx)};
  });
}

// ---------------------------------------------------------------- build each video
const fps = spec.fps ?? 30;
const timeline = {};
fs.mkdirSync('out', {recursive: true});
const srtTime = (t) => {
  const ms = Math.max(0, Math.round(t * 1000));
  const p = (v, l = 2) => String(v).padStart(l, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};

for (const [vid, V] of Object.entries(spec.videos)) {
  // place takes back to back: lead, take, gap, take, ... tail
  const off = {};
  let cursor = V.lead ?? 0.3;
  const clips = [];
  for (const take of V.takes) {
    if (!WORDS[take]) throw new Error(`Video "${vid}" uses take "${take}", which is not in words.json. Known: ${Object.keys(WORDS).join(', ')}`);
    const clean = path.resolve('public/audio/voice', `${take}.wav`);
    const orig = path.resolve('public/audio/voice/takes', `${take}.wav`);
    const file = fs.existsSync(clean) ? clean : orig;
    const dur = fs.existsSync(file) ? wavDuration(file) : WORDS[take].at(-1).e + 0.3;
    const at = V.placement?.[take] ?? cursor;
    off[take] = at;
    clips.push({src: path.relative(path.resolve('public'), file).split(path.sep).join('/'), at: +at.toFixed(3)});
    cursor = at + dur + (V.gap ?? 0.9);
  }
  const lastEnd = Math.max(...V.takes.map((tk) => off[tk] + WORDS[tk].at(-1).e));
  const duration = +(V.duration ?? Math.ceil((lastEnd + (V.tail ?? 4)) * 10) / 10).toFixed(2);
  const abs = (a) => {
    const {take, phrase, nth} = parseAnchor(a);
    if (off[take] === undefined) throw new Error(`Anchor "${a}" uses take "${take}", which is not in video "${vid}" (takes: ${V.takes.join(', ')})`);
    return +(findPhrase(take, phrase, nth).s + off[take]).toFixed(3);
  };

  // captions
  const caps = [];
  for (const [take, texts] of Object.entries(V.captions ?? {})) {
    if (off[take] === undefined) throw new Error(`Captions given for take "${take}", which is not in video "${vid}"`);
    alignCaptions(take, texts).forEach((r) => r && caps.push({take, ...r, s: WORDS[take][r.i0].s + off[take], e0: WORDS[take][r.i1].e + off[take]}));
  }
  caps.sort((a, b) => a.s - b.s);
  const captions = caps.map((c, k) => {
    const next = caps[k + 1];
    const e = next ? Math.min(c.e0 + 0.35, next.s - 0.05) : c.e0 + 0.35;
    return {s: +c.s.toFixed(3), e: +Math.max(e, c.s + 0.6).toFixed(3), text: c.text};
  });

  // scenes: start 0.3 s before their anchor phrase so the picture is settled when the words land
  const lead = V.sceneLead ?? 0.3;
  const scenes = Object.entries(V.scenes).map(([id, a]) => ({id, start: a ? Math.max(0, +(abs(a) - lead).toFixed(3)) : 0}));
  scenes.forEach((s, k) => (s.end = k + 1 < scenes.length ? scenes[k + 1].start : duration));
  for (let k = 1; k < scenes.length; k++)
    if (scenes[k].start <= scenes[k - 1].start) warnings.push(`Scene ${scenes[k].id} starts at or before ${scenes[k - 1].id}: check the anchor order`);

  const cues = Object.fromEntries(Object.entries(V.cues ?? {}).map(([k, a]) => [k, abs(a)]));
  const music = V.music === false ? null : fs.existsSync(path.resolve('public/audio/music', `${vid}_bed.wav`)) ? `audio/music/${vid}_bed.wav` : null;
  timeline[vid] = {fps, duration, clips, music, scenes, captions, cues};

  fs.writeFileSync(path.join('out', `${vid}.srt`), captions.map((c, k) => `${k + 1}\n${srtTime(c.s)} --> ${srtTime(c.e)}\n${c.text}\n`).join('\n'));
  const nWords = V.takes.reduce((n, tk) => n + WORDS[tk].length, 0);
  const speech = V.takes.reduce((n, tk) => n + WORDS[tk].at(-1).e - WORDS[tk][0].s, 0);
  const mm = `${Math.floor(duration / 60)}:${String(Math.round(duration % 60)).padStart(2, '0')}`;
  console.log(`\n${vid}: ${mm} (${duration} s), ${scenes.length} scenes, ${captions.length} captions, ${Object.keys(cues).length} cues, ${((nWords / speech) * 60).toFixed(0)} wpm`);
  console.log('  ' + scenes.map((s) => `${s.id}@${s.start.toFixed(1)}`).join('  '));
  if (V.maxDuration && duration > V.maxDuration) warnings.push(`${vid} is ${duration} s, over its ${V.maxDuration} s cap by ${(duration - V.maxDuration).toFixed(1)} s: shorten gaps/tail or the script`);
}

fs.mkdirSync('src/data', {recursive: true});
fs.writeFileSync('src/data/timeline.json', JSON.stringify(timeline, null, 1));
console.log(`\nwrote src/data/timeline.json and out/*.srt`);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  warnings.forEach((w) => console.log('  - ' + w));
}
