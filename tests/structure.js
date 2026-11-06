// Structure check for the split game files. Catches the usual mistakes when adding or moving code:
//  1. every file index.html loads exists, and sw.js saves it for offline play;
//  2. every game file starts with a comment saying what it is for;
//  3. no function is declared at the top level of two files (the files share one scope);
//  4. no file uses something that is only defined in a LATER file while the game loads
//     (including mistakes hidden inside try/catch). Fix those by moving the function to an earlier file.
const fs = require('fs');
const path = require('path');
const { readGame, loadGame, stub } = require('./lib/game.js');

const root = path.join(__dirname, '..');
const errs = [];
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const game = readGame(path.join(root, 'index.html'));
if (game.layout !== 'split') {
  console.error('STRUCTURE: index.html still has the old single inline script');
  process.exit(1);
}

// 1. files exist and are saved for offline play
const local = [
  ...[...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]),
  ...[...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]),
].filter((f) => !/^(https?:)?\/\//.test(f));
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
for (const f of local.concat(['img/logo.jpg'])) {
  if (!fs.existsSync(path.join(root, f))) errs.push('missing file ' + f);
  if (!sw.includes("'./" + f + "'")) errs.push('sw.js SHELL does not list ./' + f + ' (it would not work offline)');
}

// 2. + 3. header comment, unique top-level names
const seen = {};
for (const f of game.files) {
  if (!/^\/\/ \S/.test(f.code)) errs.push(f.name + ' should start with a // comment saying what the file is for');
  // Top-level functions start at the beginning of a line (the formatter guarantees this). Two files declaring the
  // same function would silently replace each other. (Duplicate const/let names already stop the game loading.)
  for (const m of f.code.matchAll(/^(?:async\s+)?function\s*\*?\s*(\w+)/gm)) {
    const n = m[1];
    if (seen[n] && seen[n] !== f.name)
      errs.push('function ' + n + ' is declared in both ' + seen[n] + ' and ' + f.name);
    else if (seen[n]) errs.push('function ' + n + ' is declared twice in ' + f.name);
    seen[n] = seen[n] || f.name;
  }
}

// 4. load the game file by file and report anything used before its file has loaded
const p = stub();
const sb = {
  THREE: p,
  document: p,
  navigator: p,
  innerWidth: 1000,
  innerHeight: 700,
  devicePixelRatio: 1,
  performance,
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  requestAnimationFrame: () => 1,
  addEventListener() {},
  setTimeout: () => 0,
  clearTimeout() {},
  setInterval: () => 0,
  clearInterval() {},
  console,
  Math,
  JSON,
  Object,
  Array,
  Float32Array,
  Number,
  String,
  Date,
};
sb.window = sb;
sb.__caught = (e, file) => {
  if (e instanceof ReferenceError) errs.push('while loading ' + file + ' (hidden by try/catch): ' + e.message);
};
try {
  loadGame(path.join(root, 'index.html'), sb, {
    transform: (code, file) =>
      code.replace(/catch\s*\((\w+)\)\s*\{/g, (m, v) => m + '__caught(' + v + ',' + JSON.stringify(file) + ');'),
  });
} catch (e) {
  errs.push('while loading the game: ' + e.message + ' (' + (e.stack.split('\n')[1] || '').trim() + ')');
}

if (errs.length) {
  console.error('STRUCTURE ERRORS:\n - ' + errs.join('\n - '));
  process.exit(1);
}
console.log(
  'STRUCTURE OK: ' +
    game.files.length +
    ' game files, all saved for offline play, ' +
    Object.keys(seen).length +
    ' top-level functions (no duplicates), clean load order',
);
