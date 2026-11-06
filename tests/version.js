// Version check: every change to the game must raise VERSION (RELEASE.UPDATE.CHANGE, e.g. 0.4.11).
// Before a commit (uncommitted changes present) it compares with the last commit (HEAD).
// On GitHub (clean checkout) it compares with the previous commit (HEAD~1).
const fs = require('fs'),
  path = require('path'),
  { execSync } = require('child_process');
const root = path.join(__dirname, '..');
const GAME_FILES = ['index.html', 'js', 'css', 'img', 'sw.js', 'manifest.webmanifest', 'icons'];
// VERSION lives in js/core/config.js since v0.8.2 (in index.html before that).
const VER_FILES = ['js/core/config.js', 'index.html'];
const verOf = (src) => {
  const m = (src || '').match(/const VERSION\s*=\s*'([^']*)'/);
  return m ? m[1] : null;
};
const read = (f) => {
  try {
    return fs.readFileSync(path.join(root, f), 'utf8');
  } catch (e) {
    return '';
  }
};
const cur = VER_FILES.map((f) => verOf(read(f))).find(Boolean) || null;
if (!cur || !/^\d+\.\d+\.\d+$/.test(cur)) {
  console.error('VERSION ERROR: VERSION in js/core/config.js must look like 0.4.11 (found ' + cur + ')');
  process.exit(1);
}
const git = (c) => execSync('git ' + c, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
let base;
try {
  const dirty = git('status --porcelain -- ' + GAME_FILES.join(' ')).trim() !== '';
  base = dirty ? 'HEAD' : 'HEAD~1';
  git('rev-parse --verify ' + base);
} catch (e) {
  console.log('VERSION OK: v' + cur + ' (no earlier commit to compare with)');
  process.exit(0);
}
let changed;
try {
  changed = git(
    (base === 'HEAD' ? 'diff --name-only HEAD -- ' : 'diff --name-only HEAD~1 HEAD -- ') + GAME_FILES.join(' '),
  ).trim();
} catch (e) {
  console.log('VERSION OK: v' + cur + ' (could not diff)');
  process.exit(0);
}
if (!changed) {
  console.log('VERSION OK: v' + cur + ' (no game files changed)');
  process.exit(0);
}
let prev = null;
for (const f of VER_FILES) {
  try {
    prev = verOf(git('show ' + base + ':' + f));
  } catch (e) {}
  if (prev) break;
}
const num = (v) => (v || '0').split('.').map(Number).concat([0, 0, 0]).slice(0, 3);
const gt = (a, b) => {
  const x = num(a),
    y = num(b);
  for (let i = 0; i < 3; i++) {
    if (x[i] !== y[i]) return x[i] > y[i];
  }
  return false;
};
if (prev && !gt(cur, prev)) {
  console.error(
    'VERSION ERROR: game files changed (' +
      changed.split('\n').join(', ') +
      ') but VERSION is still ' +
      cur +
      ' (was ' +
      prev +
      '). Raise the last number, e.g. ' +
      num(prev).slice(0, 2).join('.') +
      '.' +
      (num(prev)[2] + 1) +
      '.',
  );
  process.exit(1);
}
console.log('VERSION OK: v' + (prev ? prev + ' -> v' : '') + cur);
