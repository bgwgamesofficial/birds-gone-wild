// Infinite Run ceiling camper: hits per minute. See tests/tools/README.md.
const fs = require('fs'),
  vm = require('vm');
const html = fs.readFileSync(process.argv[2], 'utf8');
let code = require('../lib/game.js').gameCode(process.argv[2]); // loads single-file and split versions alike
code = code.replace('function foeHit(f){', 'function foeHit(f){if(gt>=ghost)window.__h=(window.__h||0)+1;');
code = code.replace(
  "reset();showCard('Birds Gone Wild'",
  "window.__C={go:(sc)=>{if(typeof BR!=='undefined')BR=false;reset();score=sc;state='play';speed=SPEED;paused=false;if(typeof cdEnd!=='undefined')cdEnd=0;},pin:()=>{y=CEIL;vy=0;wallet=1e9;lifePts=0;lvlOpen=false;shopOpen=false;paused=false;state='play';}};reset();showCard('Birds Gone Wild'",
);
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
const raf = [];
const sb = {
  THREE: p,
  document: p,
  navigator: p,
  innerWidth: 1000,
  innerHeight: 700,
  devicePixelRatio: 1,
  performance,
  localStorage: { getItem: () => null, setItem() {}, removeItem() {}, length: 0, key: () => null },
  requestAnimationFrame: (cb) => {
    raf.push(cb);
    return 1;
  },
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
  AudioContext: undefined,
};
sb.window = sb;
vm.createContext(sb);
code.run(sb);
let t = 1000;
for (const sc of [0, 15, 40]) {
  sb.__h = 0;
  sb.__C.go(sc);
  for (let i = 0; i < 3600; i++) {
    sb.__C.pin();
    t += 16.667;
    const cb = raf.shift();
    cb && cb(t);
  }
  console.log('Infinite Run, score ' + sc + ': riding the ceiling for 60 s -> hit', sb.__h, 'times');
}
