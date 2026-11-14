// Creates a new video project: copies the Remotion template and the helper scripts.
// usage: node <skill>/scripts/init_project.mjs <targetFolder> [--force]
// Then: cd <targetFolder> && npm install
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith('--'));
const force = args.includes('--force');
if (!target) {
  console.error('usage: node init_project.mjs <targetFolder> [--force]');
  process.exit(1);
}
const dest = path.resolve(target);
if (fs.existsSync(dest) && fs.readdirSync(dest).length && !force) {
  console.error(`${dest} is not empty. Choose a new folder, or pass --force to copy into it (existing files with the same names are overwritten).`);
  process.exit(1);
}
const template = path.resolve(here, '../assets/remotion-template');
fs.cpSync(template, dest, {recursive: true});
// project-side scripts (everything except this initializer and the machine check)
const skip = new Set(['init_project.mjs', 'check_env.mjs']);
fs.mkdirSync(path.join(dest, 'scripts'), {recursive: true});
for (const f of fs.readdirSync(here)) {
  if (!skip.has(f) && /\.(mjs|py)$/.test(f)) fs.copyFileSync(path.join(here, f), path.join(dest, 'scripts', f));
}
fs.copyFileSync(path.resolve(here, '../assets/video.spec.example.json'), path.join(dest, 'video.spec.json'));
console.log(`Created ${dest}
Next:
  cd "${dest}"
  npm install
  npx remotion studio          (preview the example)
Then put voice takes in public/audio/voice/takes/ and follow references/remotion-build.md.`);
