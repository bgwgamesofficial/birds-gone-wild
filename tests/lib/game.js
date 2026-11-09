// Shared helper for the tests and simulation tools: loads the real game code into a Node "vm" sandbox
// (with a stubbed 3D library), the same way a browser loads it.
//
// Works with both layouts, so tools can compare today's game with any older version from git history:
//   - split layout (v0.8.2 and later): index.html lists the game files in <script src="..."> tags; each file runs
//     as its own script in one shared scope, in the listed order (exactly like a browser).
//   - single-file layout (up to v0.8.1): one big inline <script> wrapped in (function(){ ... })();
//
// options.wrap  = { functionName: 'code to run at the start of that function' }  (e.g. count hawk hits)
// options.hooks = code that runs just before the game boots (js/main.js); it can read and change every game
//                 variable, so tools use it to expose helpers such as window.__fn = {...}.
// options.transform = (code, fileName) => code   optional change to each file before it runs (used by checks).
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const INLINE = /<script>\n\(function\(\)\{[\s\S]*?<\/script>/;
const BOOT_FILE = 'js/main.js';
const BOOT_ANCHOR = "reset();showCard('Birds Gone Wild'";

// Returns { layout: 'inline', code } or { layout: 'split', files: [{ name, code }] }.
function readGame(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const inline = html.match(INLINE);
  if (inline) return { layout: 'inline', code: inline[0].replace(/^<script>/, '').replace(/<\/script>$/, '') };
  const dir = path.dirname(htmlPath);
  const names = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)]
    .map((m) => m[1])
    .filter((src) => !/^(https?:)?\/\//.test(src)); // skip the 3D library from its CDN
  if (!names.length) throw new Error('No game script found in ' + htmlPath);
  return {
    layout: 'split',
    files: names.map((name) => ({ name, code: fs.readFileSync(path.join(dir, name), 'utf8') })),
  };
}

function loadGame(htmlPath, sandbox, options = {}) {
  const wrap = options.wrap || {};
  const hooks = options.hooks || '';
  const transform = options.transform || ((code) => code);
  const game = readGame(htmlPath);
  if (!vm.isContext(sandbox)) vm.createContext(sandbox);

  if (game.layout === 'inline') {
    let code = game.code;
    for (const [name, prefix] of Object.entries(wrap)) {
      const re = new RegExp('function ' + name + '\\(([^)]*)\\)\\{');
      if (!re.test(code)) throw new Error('wrap: function ' + name + ' not found');
      code = code.replace(re, (m) => m + prefix + ';');
    }
    if (hooks) {
      if (!code.includes(BOOT_ANCHOR)) throw new Error('hooks: boot line not found');
      code = code.replace(BOOT_ANCHOR, hooks + ';' + BOOT_ANCHOR);
    }
    vm.runInContext(transform(code, 'index.html'), sandbox, { filename: htmlPath });
    return game;
  }

  for (const file of game.files) {
    if (file.name === BOOT_FILE) {
      for (const [name, prefix] of Object.entries(wrap)) {
        const all = game.files.map((f) => f.code).join('\n');
        const m = all.match(new RegExp('function ' + name + '\\s*\\(([^)]*)\\)'));
        if (!m) throw new Error('wrap: function ' + name + ' not found');
        const run =
          name +
          '=(function(orig){return function(' +
          m[1] +
          '){' +
          prefix +
          ';return orig.apply(this,arguments);};})(' +
          name +
          ');';
        vm.runInContext(run, sandbox, { filename: 'wrap:' + name });
      }
      if (hooks) vm.runInContext(hooks, sandbox, { filename: 'hooks' });
    }
    vm.runInContext(transform(file.code, file.name), sandbox, { filename: file.name });
  }
  return game;
}

// Lets older tools keep their simple "patch the source" style on both layouts:
//   let code = gameCode(file);
//   code = code.replace('function foeHit(f){', 'function foeHit(f){ ...extra... ');   // run extra code first
//   code = code.replace(BOOT_ANCHOR, '...helpers...' + BOOT_ANCHOR);                  // helpers before boot
//   code.run(sandbox);
class GameCode {
  constructor(htmlPath) {
    this.htmlPath = htmlPath;
    this.wrap = {};
    this.hooks = '';
  }
  replace(find, by) {
    const fn = find.match(/^function (\w+)\(([^)]*)\)\{$/);
    if (fn && by.startsWith(find)) {
      this.wrap[fn[1]] = (this.wrap[fn[1]] ? this.wrap[fn[1]] + ';' : '') + by.slice(find.length);
      return this;
    }
    if (find === BOOT_ANCHOR && by.endsWith(BOOT_ANCHOR)) {
      this.hooks += by.slice(0, -BOOT_ANCHOR.length);
      return this;
    }
    throw new Error('GameCode.replace: unsupported patch ' + find);
  }
  run(sandbox) {
    return loadGame(this.htmlPath, sandbox, { wrap: this.wrap, hooks: this.hooks });
  }
}
const gameCode = (htmlPath) => new GameCode(htmlPath);

// A do-nothing stand-in for THREE, document and navigator: any property or call returns itself.
function stub() {
  const f = function () {};
  const p = new Proxy(f, {
    get(t, k) {
      if (k === Symbol.toPrimitive) return () => 0;
      if (k === 'then') return undefined;
      if (k === 'length' || k === 'count') return 0;
      return p;
    },
    apply() {
      return p;
    },
    construct() {
      return p;
    },
    set() {
      return true;
    },
  });
  return p;
}

module.exports = { readGame, loadGame, gameCode, stub, BOOT_FILE, BOOT_ANCHOR };
