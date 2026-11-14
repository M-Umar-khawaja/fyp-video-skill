// Render review stills at chosen times from ONE bundle, then remove the bundle.
// usage: node scripts/stills.mjs <CompositionId> <t1> <t2> ... [--out out/stills] [--scale 0.5]
//        node scripts/stills.mjs <CompositionId> --every 2      (one still every 2 s)
//        node scripts/stills.mjs <CompositionId> --cues          (one still 0.6 s after every cue)
// Look at every image: overlaps, clipped text, things appearing before their word, empty frames.
import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {browserOpts, cleanRemotionTemp, log, parseArgs} from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const [id, ...times] = args._;
if (!id) {
  console.error('usage: node scripts/stills.mjs <CompositionId> <t1> <t2> ... | --every <s> | --cues');
  process.exit(1);
}
const outDir = path.resolve(args.out ?? 'out/stills');
fs.mkdirSync(outDir, {recursive: true});
const scale = args.scale ? +args.scale : 0.5;
const opts = browserOpts();

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), enableCaching: false});
try {
  const composition = await selectComposition({serveUrl, id, ...opts});
  const dur = composition.durationInFrames / composition.fps;
  let ts = times.map(Number);
  if (args.every) for (let t = 0; t < dur; t += +args.every) ts.push(+t.toFixed(2));
  if (args.cues) {
    const tl = JSON.parse(fs.readFileSync('src/data/timeline.json', 'utf8'));
    const v = Object.values(tl).find((x) => Math.abs(x.duration * x.fps - composition.durationInFrames) < 1) ?? Object.values(tl)[0];
    ts.push(...Object.values(v.cues).map((t) => +(t + 0.6).toFixed(2)));
  }
  ts = [...new Set(ts)].filter((t) => t >= 0 && t < dur).sort((a, b) => a - b);
  for (const t of ts) {
    const frame = Math.min(composition.durationInFrames - 1, Math.round(t * composition.fps));
    const output = path.join(outDir, `${id}_${t.toFixed(2).padStart(7, '0')}.jpg`);
    await renderStill({serveUrl, composition, frame, output, imageFormat: 'jpeg', jpegQuality: 80, scale, ...opts});
    console.log(output);
  }
  log(`${ts.length} stills in ${path.relative(process.cwd(), outDir)}`);
} finally {
  fs.rmSync(serveUrl, {recursive: true, force: true});
  cleanRemotionTemp();
}
