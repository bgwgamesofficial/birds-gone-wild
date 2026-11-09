// Syntax check: parses every game script listed in index.html (and sw.js) without running it.
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const { readGame } = require('./lib/game.js');

const root = path.join(__dirname, '..');
let game;
try {
  game = readGame(path.join(root, 'index.html'));
} catch (e) {
  console.error('Game script not found:', e.message);
  process.exit(1);
}
const files = game.layout === 'inline' ? [{ name: 'index.html', code: game.code }] : game.files;
files.push({ name: 'sw.js', code: fs.readFileSync(path.join(root, 'sw.js'), 'utf8') });
let bad = 0;
for (const f of files) {
  try {
    new vm.Script(f.code, { filename: f.name });
  } catch (e) {
    console.error('SYNTAX ERROR in ' + f.name + ': ' + e.message);
    bad++;
  }
}
if (bad) process.exit(1);
console.log('SYNTAX OK (' + files.length + ' files)');
