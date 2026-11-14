// Word-level timestamps for every voice take, using local whisper.cpp (no cloud, no API key).
// usage: node scripts/transcribe.mjs [--dir public/audio/voice/takes] [--model base.en] [--language en] [--only NAME]
// output: scripts/words.json  { "<take file stem>": [ {t: " word", s: ms, e: ms}, ... ] }
// The first run downloads whisper.cpp (~50 MB) and the model (~150 MB for base.en) into ./whisper.cpp
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {downloadWhisperModel, installWhisperCpp, toCaptions, transcribe} from '@remotion/install-whisper-cpp';
import {findTool, log, parseArgs, run, wavDuration} from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const dir = path.resolve(args.dir ?? 'public/audio/voice/takes');
// base.en is fast and accurate enough for alignment; use "small" / "base" (multilingual) for non-English narration.
const model = args.model ?? (args.language && args.language !== 'en' ? 'small' : 'base.en');
const version = '1.5.5'; // whisper.cpp release known to work with @remotion/install-whisper-cpp 4.0.x
const to = path.resolve('whisper.cpp');
const outFile = path.resolve('scripts/words.json');

const files = fs
  .readdirSync(dir)
  .filter((f) => /\.wav$/i.test(f))
  .filter((f) => !args.only || path.parse(f).name === args.only);
if (!files.length) {
  console.error(`No .wav files in ${dir}. Put the voice takes there first (MP3/M4A: convert with ffmpeg -i in.m4a out.wav).`);
  process.exit(1);
}

// Network hiccups are common on first download; retry a few times before giving up.
const retry = async (what, fn) => {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i >= 4) throw new Error(`${what} failed after ${i} tries: ${e.message}`);
      log(`${what} failed (${e.code ?? e.message}); retrying in ${i * 5} s`);
      await new Promise((r) => setTimeout(r, i * 5000));
    }
  }
};
await retry('whisper.cpp install', () => installWhisperCpp({to, version}));
await retry('model download', () => downloadWhisperModel({model, folder: to}));

const ffmpeg = findTool('ffmpeg');
const words = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : {};
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fyp-whisper-'));
try {
  for (const f of files) {
    const name = path.parse(f).name;
    const src = path.join(dir, f);
    const wav16 = path.join(tmp, `${name}.wav`);
    run(ffmpeg, ['-y', '-i', src, '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', wav16]); // whisper.cpp needs 16 kHz mono
    const opts = {inputPath: wav16, whisperPath: to, whisperCppVersion: version, model, tokenLevelTimestamps: true};
    if (args.language) opts.language = args.language;
    const res = await transcribe(opts);
    const {captions} = toCaptions({whisperCppOutput: res});
    words[name] = captions.map((c) => ({t: c.text, s: c.startMs, e: c.endMs}));
    const text = captions.map((c) => c.text).join('').trim();
    const dur = wavDuration(src);
    const n = text.split(/\s+/).filter(Boolean).length;
    log(`${name}: ${dur.toFixed(1)} s, ${n} words, ${((n / dur) * 60).toFixed(0)} wpm`);
    console.log(`  ${text}\n`);
  }
} finally {
  fs.rmSync(tmp, {recursive: true, force: true});
}
fs.writeFileSync(outFile, JSON.stringify(words));
log(`wrote ${path.relative(process.cwd(), outFile)} (${Object.keys(words).length} takes). Compare each transcript with the script now.`);
