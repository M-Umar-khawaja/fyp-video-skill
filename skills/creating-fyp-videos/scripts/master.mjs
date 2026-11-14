// Mastering pass for delivery:
//  - video: H.264 High, BT.709 limited range, yuv420p (plays correctly on projectors, PowerPoint, phones)
//  - audio: two-pass EBU R128 loudness normalisation to -16 LUFS integrated, -1.5 dBTP, AAC 48 kHz stereo
//  - fast-start (moov at the front) for web playback
// usage: node scripts/master.mjs <in.mp4> <out.mp4> [--audio other.mp4|.wav] [--copy-audio]
//   --audio       take the audio from another file (e.g. a separately rendered WAV)
//   --copy-audio  copy that audio unchanged (it is already mastered, e.g. the captioned twin's)
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {findTool, parseArgs} from './lib.mjs';

const TARGET = 'I=-16:TP=-1.5:LRA=11'; // common online-video loudness; -1.5 dBTP leaves headroom for AAC encoding
const lastJson = (s) => JSON.parse(s.slice(s.lastIndexOf('{'), s.lastIndexOf('}') + 1));

const isFullRange = (ffprobe, file) => {
  const r = spawnSync(ffprobe, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=pix_fmt,color_range', '-of', 'json', file], {encoding: 'utf8'});
  const s = JSON.parse(r.stdout || '{}').streams?.[0] ?? {};
  // Remotion encodes JPEG frames as full range (yuvj420p / "pc"); many players then show crushed or washed-out colour.
  return s.pix_fmt === 'yuvj420p' || s.color_range === 'pc';
};

export function master({video, audio, out, copyAudio = false, crf = 16, preset = 'medium'}) {
  const ffmpeg = findTool('ffmpeg');
  const ffprobe = findTool('ffprobe');
  const aSrc = audio ?? video;
  let af = null;
  if (!copyAudio) {
    const p1 = spawnSync(ffmpeg, ['-hide_banner', '-i', aSrc, '-vn', '-af', `loudnorm=${TARGET}:print_format=json`, '-f', 'null', '-'], {encoding: 'utf8', maxBuffer: 1 << 26});
    if (p1.status !== 0) throw new Error(`loudness measurement failed:\n${p1.stderr.slice(-1500)}`);
    const m = lastJson(p1.stderr);
    af = `loudnorm=${TARGET}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true:print_format=json`;
  }
  const vf = isFullRange(ffprobe, video)
    ? 'scale=in_range=full:out_range=limited:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p'
    : 'format=yuv420p';
  const inputs = audio ? ['-i', video, '-i', audio, '-map', '0:v', '-map', '1:a', '-shortest'] : ['-i', video, '-map', '0:v', '-map', '0:a?'];
  const aArgs = copyAudio ? ['-c:a', 'copy'] : ['-af', af, '-ar', '48000', '-ac', '2', '-c:a', 'aac', '-b:a', '192k'];
  const args = [
    '-hide_banner', '-y', ...inputs,
    // -threads 4 and a short lookahead keep x264's memory low on 8 GB laptops
    '-vf', vf, '-c:v', 'libx264', '-preset', preset, '-crf', String(crf), '-profile:v', 'high', '-tune', 'animation',
    '-threads', '4', '-x264-params', 'rc-lookahead=20',
    '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    ...aArgs, '-movflags', '+faststart', out,
  ];
  const p2 = spawnSync(ffmpeg, args, {encoding: 'utf8', maxBuffer: 1 << 26});
  if (p2.status !== 0) throw new Error(`mastering failed:\n${p2.stderr.slice(-2000)}`);
  return copyAudio ? null : lastJson(p2.stderr);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = parseArgs(process.argv.slice(2));
  const [inp, out] = a._;
  if (!inp || !out) {
    console.error('usage: node scripts/master.mjs <in.mp4> <out.mp4> [--audio file] [--copy-audio]');
    process.exit(1);
  }
  const r = master({video: inp, audio: a.audio, out, copyAudio: !!a['copy-audio']});
  console.log(r ? `mastered ${out}: ${r.output_i} LUFS, ${r.output_tp} dBTP (${r.normalization_type})` : `mastered ${out} (audio copied)`);
}
