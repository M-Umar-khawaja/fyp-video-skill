// Checks the machine before building. Run from anywhere: node <skill>/scripts/check_env.mjs [projectDir]
// Prints what was found and what it means for the build (no installs, no changes).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const dir = path.resolve(process.argv[2] || '.');
const ok = (m) => console.log(`  OK    ${m}`);
const warn = (m) => console.log(`  WARN  ${m}`);
const bad = (m) => console.log(`  FAIL  ${m}`);
const has = (cmd, args = ['--version']) => {
  const r = spawnSync([cmd, ...args].join(' '), {encoding: 'utf8', shell: true}); // one string: works for .cmd shims on Windows
  return r.status === 0 ? (r.stdout || r.stderr).trim().split('\n')[0] : null;
};

console.log(`Environment check for ${dir}\n`);

const [maj] = process.versions.node.split('.').map(Number);
maj >= 18 ? ok(`Node ${process.versions.node}`) : bad(`Node ${process.versions.node}: Remotion needs Node 18 or newer`);
has('npm') ? ok('npm available') : bad('npm not found');

let free = NaN;
try {
  const s = fs.statfsSync(fs.existsSync(dir) ? dir : os.homedir());
  free = (s.bavail * s.bsize) / 1e9;
} catch {}
if (Number.isNaN(free)) warn('Could not read free disk space');
else if (free >= 4) ok(`Disk: ${free.toFixed(1)} GB free`);
else if (free >= 1.5) warn(`Disk: ${free.toFixed(1)} GB free. Enough only with chunked rendering (scripts/render.mjs); clean temp bundles between steps.`);
else bad(`Disk: ${free.toFixed(1)} GB free. Need ~1.5 GB minimum (node_modules ~300 MB, whisper ~200 MB, render temp files). Ask the user to free space first.`);

const ram = os.totalmem() / 1e9, freeRam = os.freemem() / 1e9;
const ramMsg = `RAM: ${ram.toFixed(1)} GB total, ${freeRam.toFixed(1)} GB free`;
ram >= 12 ? ok(ramMsg) : warn(`${ramMsg}. Use concurrency 2-3, render one video at a time, and close other apps. On Windows the page file grows into free disk space during renders; a restart gives it back.`);
ok(`CPU: ${os.cpus().length} threads (${os.cpus()[0]?.model?.trim() ?? 'unknown'})`);

const chromes = {
  win32: [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    `${process.env.LOCALAPPDATA ?? ''}/Google/Chrome/Application/chrome.exe`,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ],
  darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'],
  linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'],
}[process.platform] ?? [];
const chrome = chromes.find((p) => p && fs.existsSync(p));
if (process.env.REMOTION_BROWSER_EXECUTABLE) ok(`REMOTION_BROWSER_EXECUTABLE=${process.env.REMOTION_BROWSER_EXECUTABLE}`);
else if (chrome) ok(`Installed browser: ${chrome}\n        To skip Remotion's headless-browser download, set REMOTION_BROWSER_EXECUTABLE to this path.`);
else warn('No installed Chrome found; Remotion will download its own headless browser (~100-200 MB) on first render.');

const py = has('python3') ? 'python3' : has('python') ? 'python' : has('py') ? 'py' : null;
if (!py) warn('Python not found: audio_tools.py (voice cleanup, music, sound effects) needs Python 3 + numpy.');
else {
  const np = spawnSync(`${py} -c "import numpy; print(numpy.__version__)"`, {encoding: 'utf8', shell: true});
  np.status === 0 ? ok(`${py} with numpy ${np.stdout.trim()}`) : warn(`${py} found but numpy missing: run "${py} -m pip install numpy"`);
}

has('ffmpeg', ['-version']) ? ok('ffmpeg on PATH (optional; Remotion ships its own)') : ok('ffmpeg not on PATH (fine: the scripts use the copy bundled with Remotion)');
has('git') ? ok('git available') : warn('git not found (optional)');
console.log('\nDone.');
