// Small simulations (camp | max3 | fly | boss | hits | bosshits). usage: node sim.js <index.html> <what>. See README.md.
const fs = require('fs'),
  vm = require('vm'),
  [file, what] = process.argv.slice(2);
const html = fs.readFileSync(file, 'utf8');
let code = require('../lib/game.js').gameCode(file); // loads single-file and split versions alike
code = code.replace(
  'function foeHit(f){',
  "function foeHit(f){if(gt>=ghost){window.__hits=(window.__hits||0)+1;if(f.kind==='boss')window.__bh=(window.__bh||0)+1;}",
);
code = code.replace(
  "reset();showCard('Birds Gone Wild'",
  "window.__p={hearts:()=>{if(typeof lifePts!=='undefined')lifePts=300;if(state!=='play')state='play';},go:(l)=>{if(typeof BR!=='undefined')BR=true;level=l;reset();state='play';speed=SPEED;paused=false;cdEnd=0;wallet=1e9;},hold:(yy)=>{y=yy;vy=0;wallet=1e9;lifePts=0;lvlOpen=false;shopOpen=false;paused=false;cdEnd=0;if(state!=='play')state='play';},chase:(dt)=>{ghost=gt+99;let tg=4,bd=99;flies.forEach(f=>{const d=f.dir*f.x;if(d>-.5&&d<bd){bd=d;tg=f.y;}});y+=Math.max(-9*dt,Math.min(9*dt,tg-y));vy=0;lvlOpen=false;shopOpen=false;paused=false;cdEnd=0;},act:()=>{let n=0;foes.forEach(f=>{if(f.tt!==undefined||f.dir*f.x>-.4)n++;});return n;},st:()=>({level,lvProg:typeof lvProg!=='undefined'?lvProg:0,need:typeof lvNeed!=='undefined'?lvNeed():0,CEIL,gt})};reset();showCard('Birds Gone Wild'",
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
  localStorage: { getItem: () => null, setItem() {}, length: 0, key: () => null, removeItem() {} },
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
const P = sb.__p;
const step = () => {
  t += 16.667;
  const cb = raf.shift();
  cb && cb(t);
};
if (what === 'camp') {
  for (const L of [3, 12, 25]) {
    sb.__hits = 0;
    P.go(L);
    const C = P.st().CEIL;
    for (let i = 0; i < 60 * 60; i++) {
      P.hold(C);
      step();
    }
    console.log('level', L, 'riding the ceiling for 60 s: hit', sb.__hits, 'times');
  }
}
if (what === 'max3') {
  let mx = 0;
  for (const L of [5, 15, 30, 49, 50]) {
    P.go(L);
    for (let i = 0; i < 60 * 90; i++) {
      P.hold(i % 240 < 120 ? 2 : 12);
      step();
      mx = Math.max(mx, P.act());
    }
  }
  console.log('most hawks coming at you at once (levels 5-50, 90 s each):', mx);
}
if (what === 'fly') {
  for (const L of [5, 25, 45]) {
    const r = [];
    for (let k = 0; k < 2; k++) {
      P.go(L);
      const need = P.st().need;
      let fr = 0;
      while (P.st().level === L && fr < 60 * 240) {
        P.chase(1 / 60);
        step();
        fr++;
      }
      r.push((fr / 60).toFixed(0) + 's');
    }
    console.log('level', L, 'catch', P.st().need || '', ': perfect chaser took', r.join(', '));
  }
}
if (what === 'boss') {
  for (const L of [10, 30, 50]) {
    P.go(L);
    const need = P.st().need;
    let fr = 0;
    while (P.st().level === L && fr < 60 * 240) {
      P.hold(4);
      P.st();
      sb.__p.hold(4);
      step();
      fr++;
    }
    console.log('boss level', L, 'needs', need, 'passes; took', (fr / 60).toFixed(0) + 's (invincible test)');
  }
}
if (what === 'hits') {
  for (const L of [8, 12, 20, 30]) {
    sb.__hits = 0;
    P.go(L);
    for (let i = 0; i < 60 * 60; i++) {
      P.hold(3 + Math.sin(i / 90) * 4);
      step();
    }
    console.log('level', L, 'hovering bird (no dodging) for 60 s: hit', sb.__hits, 'times');
  }
}
if (what === 'bosshits') {
  const res = [];
  for (const L of [10, 20, 30, 40]) {
    let tot = 0;
    for (let r = 0; r < 6; r++) {
      sb.__hits = 0;
      sb.__bh = 0;
      P.go(L);
      for (let i = 0; i < 60 * 60; i++) {
        P.hold(3 + Math.sin(i / 90) * 4);
        sb.__p.hearts && sb.__p.hearts();
        step();
      }
      tot += sb.__bh;
    }
    res.push('L' + L + ': ' + (tot / 6).toFixed(1) + ' boss hits/min');
  }
  console.log(res.join('  '));
}
