// Shared helpers for the project scripts. Copied into <project>/scripts by init_project.mjs.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';

export const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

/** Parse "--key value" and "--flag" arguments; the rest are positional. */
export const parseArgs = (argv) => {
  const out = {_: []};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[k] = true;
      else out[k] = argv[++i];
    } else out._.push(a);
  }
  return out;
};

/** ffmpeg/ffprobe: prefer the copy that ships with Remotion's compositor, else the one on PATH. */
export const findTool = (name) => {
  const exe = process.platform === 'win32' ? `${name}.exe` : name;
  const base = path.resolve('node_modules', '@remotion');
  if (fs.existsSync(base)) {
    for (const d of fs.readdirSync(base)) {
      if (d.startsWith('compositor-')) {
        const p = path.join(base, d, exe);
        if (fs.existsSync(p)) return p;
      }
    }
  }
  const probe = spawnSync(exe, ['-version'], {encoding: 'utf8'});
  if (probe.status === 0) return exe;
  throw new Error(`${name} not found. Run "npm install" in the project folder (Remotion ships ${name}), or install ${name} and put it on PATH.`);
};

/** Run ffmpeg/ffprobe; throw with the tail of stderr on failure. */
export const run = (tool, args, {quiet = true} = {}) => {
  const r = spawnSync(tool, quiet ? ['-hide_banner', '-v', 'error', ...args] : args, {encoding: 'utf8', maxBuffer: 1 << 28});
  if (r.status !== 0) throw new Error(`${path.basename(tool)} failed:\n${(r.stderr || '').slice(-2000)}`);
  return r;
};

/** Browser options: an installed Chrome (REMOTION_BROWSER_EXECUTABLE) avoids a large download. */
export const browserOpts = () => {
  const exe = process.env.REMOTION_BROWSER_EXECUTABLE;
  return exe ? {browserExecutable: exe, chromeMode: 'chrome-for-testing'} : {};
};

/** Delete leftover Remotion temp bundles; on small disks these pile up fast (~100 MB each). */
export const cleanRemotionTemp = () => {
  const tmp = os.tmpdir();
  let n = 0;
  for (const d of fs.readdirSync(tmp)) {
    if (d.startsWith('remotion-') || d.startsWith('react-motion-')) {
      try {
        fs.rmSync(path.join(tmp, d), {recursive: true, force: true});
        n++;
      } catch {
        /* in use by another process: leave it */
      }
    }
  }
  return n;
};

export const freeDiskGB = (p = '.') => {
  try {
    const s = fs.statfsSync(path.resolve(p));
    return (s.bavail * s.bsize) / 1e9;
  } catch {
    return NaN;
  }
};

/** Duration in seconds of a PCM WAV file, read from its header (no dependencies). */
export const wavDuration = (file) => {
  const b = fs.readFileSync(file);
  if (b.toString('ascii', 0, 4) !== 'RIFF') throw new Error(`${file} is not a WAV file`);
  let off = 12, byteRate = 0;
  while (off + 8 <= b.length) {
    const id = b.toString('ascii', off, off + 4);
    const size = b.readUInt32LE(off + 4);
    // compute from rate x channels x bits: some generators (e.g. Gemini TTS) write a wrong byte-rate field
    if (id === 'fmt ') byteRate = b.readUInt32LE(off + 12) * b.readUInt16LE(off + 10) * (b.readUInt16LE(off + 22) / 8);
    if (id === 'data') return Math.min(size, b.length - off - 8) / byteRate;
    off += 8 + size + (size % 2);
  }
  throw new Error(`${file}: no data chunk`);
};
