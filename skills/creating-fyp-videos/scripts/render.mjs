// Low-disk, low-RAM, resumable render of one composition to a delivery-ready MP4.
//  1. audio rendered once to WAV (skipped with --audio-from)
//  2. video rendered muted in chunks (default 15 s); finished chunks are reused if the run is interrupted
//  3. chunks joined by stream copy, then mastered (scripts/master.mjs)
// usage: node scripts/render.mjs <CompositionId> <out.mp4> [--chunk 450] [--concurrency 3]
//                                [--audio-from <mastered twin.mp4>]   (e.g. clean copy reuses the captioned one's audio)
// Render one video at a time. Run "node scripts/qa.mjs <out.mp4>" afterwards.
import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {browserOpts, cleanRemotionTemp, findTool, freeDiskGB, log, parseArgs, run} from './lib.mjs';
import {master} from './master.mjs';

const args = parseArgs(process.argv.slice(2));
const [id, outArg] = args._;
if (!id || !outArg) {
  console.error('usage: node scripts/render.mjs <CompositionId> <out.mp4> [--chunk 450] [--concurrency 3] [--audio-from file]');
  process.exit(1);
}
const out = path.resolve(outArg);
const CHUNK = +(args.chunk ?? 450); // frames; 450 = 15 s at 30 fps, small enough that a crash costs little
const concurrency = +(args.concurrency ?? 3);
const work = path.resolve('out/_work', id);
fs.mkdirSync(work, {recursive: true});
fs.mkdirSync(path.dirname(out), {recursive: true});
const opts = browserOpts();
const ffmpeg = findTool('ffmpeg');

const disk = freeDiskGB();
if (disk < 1) log(`WARNING: only ${disk.toFixed(2)} GB free. The render may fail with ENOSPC; free space or see references/troubleshooting.md.`);

cleanRemotionTemp();
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), enableCaching: false});
let wav = null;
try {
  const comp = await selectComposition({serveUrl, id, ...opts});
  const n = comp.durationInFrames;
  if (!args['audio-from']) {
    wav = path.join(work, 'audio.wav');
    if (!fs.existsSync(wav)) await renderMedia({serveUrl, composition: comp, codec: 'wav', outputLocation: wav, ...opts});
    log('audio ready');
  }
  const parts = [];
  for (let a = 0, k = 0; a < n; a += CHUNK, k++) {
    const b = Math.min(n - 1, a + CHUNK - 1);
    const part = path.join(work, `chunk_${String(k).padStart(3, '0')}.mp4`);
    if (!(fs.existsSync(part) && fs.statSync(part).size > 1000)) {
      // crf 12: near-lossless intermediate; the master pass sets the final quality
      await renderMedia({serveUrl, composition: comp, codec: 'h264', crf: 12, muted: true, frameRange: [a, b], outputLocation: part, imageFormat: 'jpeg', jpegQuality: 95, concurrency, ...opts});
    }
    parts.push(part);
    log(`${id}: frames ${a}-${b} of ${n}`);
  }
  const list = path.join(work, 'chunks.txt');
  fs.writeFileSync(list, parts.map((p) => `file '${p.replace(/\\/g, '/')}'`).join('\n'));
  const joined = path.join(work, 'joined.mp4');
  if (wav) run(ffmpeg, ['-y', '-f', 'concat', '-safe', '0', '-i', list, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'pcm_s16le', '-shortest', joined.replace(/\.mp4$/, '.mov')]);
  else run(ffmpeg, ['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', joined]);
  parts.forEach((p) => fs.rmSync(p, {force: true})); // free the chunk space before mastering
  const src = wav ? joined.replace(/\.mp4$/, '.mov') : joined;
  const r = args['audio-from']
    ? master({video: src, audio: path.resolve(args['audio-from']), out, copyAudio: true})
    : master({video: src, out});
  log(`DONE ${out} ${(fs.statSync(out).size / 1e6).toFixed(1)} MB${r ? `, ${r.output_i} LUFS, ${r.output_tp} dBTP` : ''}`);
  fs.rmSync(work, {recursive: true, force: true});
} finally {
  fs.rmSync(serveUrl, {recursive: true, force: true});
  cleanRemotionTemp();
}
