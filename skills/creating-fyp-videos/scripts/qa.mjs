// Automated QA of a finished MP4. Checks what can be checked by machine and extracts frames
// for you to LOOK AT (the visual check is not optional).
// usage: node scripts/qa.mjs <video.mp4> [--max <seconds>] [--srt out/pitch.srt] [--every 10]
// exit code 1 if any FAIL.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {findTool, parseArgs} from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const file = args._[0];
if (!file || !fs.existsSync(file)) {
  console.error('usage: node scripts/qa.mjs <video.mp4> [--max seconds] [--srt file.srt] [--every 10]');
  process.exit(1);
}
const ffmpeg = findTool('ffmpeg');
const ffprobe = findTool('ffprobe');
let fails = 0;
const PASS = (m) => console.log(`PASS  ${m}`);
const WARN = (m) => console.log(`WARN  ${m}`);
const FAIL = (m) => (fails++, console.log(`FAIL  ${m}`));

const probe = JSON.parse(
  spawnSync(ffprobe, ['-v', 'error', '-count_packets', '-show_entries', 'format=duration,size:stream=codec_type,codec_name,profile,width,height,pix_fmt,color_range,r_frame_rate,nb_read_packets,sample_rate,channels,duration', '-of', 'json', file], {encoding: 'utf8'}).stdout,
);
const v = probe.streams.find((s) => s.codec_type === 'video');
const a = probe.streams.find((s) => s.codec_type === 'audio');
const dur = +probe.format.duration;
const [fn, fd] = (v?.r_frame_rate ?? '0/1').split('/').map(Number);
const fps = fn / fd;
console.log(`${path.basename(file)}: ${(probe.format.size / 1e6).toFixed(1)} MB, ${dur.toFixed(2)} s\n`);

if (!v) FAIL('no video stream');
else {
  v.codec_name === 'h264' ? PASS(`H.264 ${v.width}x${v.height} @ ${fps.toFixed(2)} fps`) : WARN(`video codec ${v.codec_name} (H.264 plays everywhere)`);
  v.pix_fmt === 'yuv420p' && v.color_range !== 'pc' ? PASS('yuv420p limited range') : WARN(`pix_fmt ${v.pix_fmt} / range ${v.color_range}: run scripts/master.mjs for BT.709 limited range`);
  const frames = +v.nb_read_packets;
  const expect = Math.round(dur * fps);
  Math.abs(frames - expect) <= 2 ? PASS(`${frames} frames (expected ~${expect})`) : FAIL(`${frames} frames but duration implies ${expect}: video is truncated or padded`);
}
if (!a) FAIL('no audio stream');
else {
  a.sample_rate === '48000' && a.channels === 2 ? PASS(`audio ${a.codec_name} 48 kHz stereo`) : WARN(`audio ${a.codec_name} ${a.sample_rate} Hz ${a.channels} ch`);
  const ad = +a.duration, vd = +(v?.duration ?? dur);
  Math.abs(ad - vd) < 0.2 ? PASS(`audio and video lengths match (${ad.toFixed(2)} / ${vd.toFixed(2)} s)`) : FAIL(`audio ${ad.toFixed(2)} s vs video ${vd.toFixed(2)} s`);
  const l = spawnSync(ffmpeg, ['-hide_banner', '-i', file, '-vn', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], {encoding: 'utf8', maxBuffer: 1 << 26});
  const s = l.stderr;
  const m = JSON.parse(s.slice(s.lastIndexOf('{'), s.lastIndexOf('}') + 1));
  const I = +m.input_i, TP = +m.input_tp;
  Math.abs(I + 16) <= 1 ? PASS(`loudness ${I} LUFS`) : WARN(`loudness ${I} LUFS (target -16): run scripts/master.mjs`);
  TP <= -1 ? PASS(`true peak ${TP} dBTP`) : FAIL(`true peak ${TP} dBTP: risk of clipping, master again`);
}
if (args.max) dur <= +args.max ? PASS(`duration ${dur.toFixed(2)} s within ${args.max} s cap (${(+args.max - dur).toFixed(1)} s spare)`) : FAIL(`duration ${dur.toFixed(2)} s exceeds the ${args.max} s cap`);

// black / frozen stretches from a 2 fps, 32x18 grey thumbnail stream
const raw = spawnSync(ffmpeg, ['-v', 'error', '-i', file, '-an', '-r', '2', '-vf', 'scale=32:18,format=gray', '-c:v', 'rawvideo', '-f', 'image2pipe', '-'] /* Remotion's ffmpeg has no rawvideo muxer */, {maxBuffer: 1 << 28});
if (raw.status === 0) {
  const px = 32 * 18, n = Math.floor(raw.stdout.length / px);
  let black = [], frozen = 0, maxFrozen = 0, frozenAt = 0;
  for (let i = 0; i < n; i++) {
    const f = raw.stdout.subarray(i * px, (i + 1) * px);
    const mean = f.reduce((s, x) => s + x, 0) / px;
    if (mean < 12) black.push(i / 2);
    if (i > 0) {
      const g = raw.stdout.subarray((i - 1) * px, i * px);
      let d = 0;
      for (let k = 0; k < px; k++) d += Math.abs(f[k] - g[k]);
      if (d / px < 0.3) {
        frozen++;
        if (frozen > maxFrozen) (maxFrozen = frozen), (frozenAt = (i - frozen) / 2);
      } else frozen = 0;
    }
  }
  black.length ? WARN(`near-black frames at ${black.slice(0, 8).map((t) => t.toFixed(1)).join(', ')} s${black.length > 8 ? ' …' : ''} (fine if intentional)`) : PASS('no black frames');
  maxFrozen / 2 > 6 ? WARN(`picture static for ${(maxFrozen / 2).toFixed(1)} s from ${frozenAt.toFixed(1)} s: intended hold, or a stalled scene?`) : PASS('no frozen stretches over 6 s');
} else WARN('could not analyse frames for black/frozen stretches');

if (args.srt) {
  const srt = fs.readFileSync(args.srt, 'utf8');
  const ts = [...srt.matchAll(/(\d\d):(\d\d):(\d\d),(\d\d\d) --> (\d\d):(\d\d):(\d\d),(\d\d\d)/g)].map((m) => [
    +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000,
    +m[5] * 3600 + +m[6] * 60 + +m[7] + +m[8] / 1000,
  ]);
  const overlap = ts.findIndex((t, i) => i && t[0] < ts[i - 1][1]);
  overlap < 0 ? PASS(`${ts.length} captions, none overlapping`) : FAIL(`caption ${overlap + 1} overlaps the previous one`);
  ts.at(-1)[1] <= dur ? PASS('captions end before the video does') : FAIL('last caption ends after the video');
}

// frames to inspect
const every = +(args.every ?? 10);
const qaDir = path.resolve('out/qa', path.parse(file).name);
fs.mkdirSync(qaDir, {recursive: true});
for (let t = Math.min(1, dur / 2); t < dur; t += every) {
  spawnSync(ffmpeg, ['-v', 'error', '-y', '-ss', t.toFixed(2), '-i', file, '-frames:v', '1', '-vf', 'scale=960:-2', path.join(qaDir, `t${t.toFixed(1).padStart(6, '0')}.jpg`)]);
}
spawnSync(ffmpeg, ['-v', 'error', '-y', '-sseof', '-0.5', '-i', file, '-frames:v', '1', '-vf', 'scale=960:-2', path.join(qaDir, 'last.jpg')]);
console.log(`\nFrames for visual inspection: ${path.relative(process.cwd(), qaDir)} (look at every one)`);
console.log(fails ? `\n${fails} FAIL(s)` : '\nNo automated failures.');
process.exit(fails ? 1 : 0);
