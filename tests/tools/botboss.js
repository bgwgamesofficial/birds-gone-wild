// Boss hits per minute against a dodging simulated player (Boss Run). See tests/tools/README.md.
// usage: node bot.js <index.html> <runs> [skill 0..1] [startLevel]
// Human-like: sees the same "!" info (hawk crossing height), reacts ~0.22 s late, aims with some error,
// flaps to hold a chosen height, chases butterflies on butterfly levels, never revives, never shops, takes a random upgrade.
const fs = require('fs'),
  vm = require('vm');
const [file, RUNS = '20', SKILL = '0.5', START = '1'] = process.argv.slice(2);
const skill = +SKILL;
const html = fs.readFileSync(file, 'utf8');
let code = require('../lib/game.js').gameCode(file); // loads single-file and split versions alike
code = code.replace(
  'function foeHit(f){',
  "function foeHit(f){if(gt>=ghost){if(f.kind==='boss')window.__BH=(window.__BH||0)+1;window.__H=window.__H||{};window.__H[level]=(window.__H[level]||0)+1;window.__W=window.__W||{};window.__W[level]=Math.round(wallet);}",
);
code = code.replace(
  'function die(){',
  "function die(){if(state==='play'&&gt>=ghost&&!fx.shield&&!(mode===5&&lifePts>=LIFE_SEG))window.__died=level;",
);
code = code.replace(
  "reset();showCard('Birds Gone Wild'",
  `window.__fid=0;window.__G={
 fresh:(L)=>{BR=true;restartGame();state='ready';startGame();level=L;lvProg=0;lvSpawned=0;bossOut=false;levelHearts();updXp();},
 S:()=>({state,level,lvProg,need:lvNeed(),type:lvType(),y,vy,gt,wallet,paused,cd:cdEnd,shop:shopOpen,lv:lvlOpen,offer,BOT,CEIL,CLO,
   foes:foes.map(f=>({id:(f.__id=f.__id||++window.__fid),x:f.x,dir:f.dir,h:(f.ty!==undefined?f.ty:(f.fy===undefined?f.y:f.fy)),boss:f.kind==='boss'})),
   flies:flies.map(f=>({x:f.x,dir:f.dir,y:f.fy===undefined?f.y:f.fy}))}),
 flap:()=>flap(),
 keep:()=>{lifePts=300;wallet=Math.max(wallet,1e6);},
 menus:()=>{if(shopOpen){shopOpen=false;}if(lvlOpen&&(lvlStage==='wsonly'||!lvlCh.length)){lvlOpen=false;lvlStage='shop';resumeGame();}if(lvlOpen){const c=lvlCh[Math.floor(Math.random()*lvlCh.length)];if(c.id==='cash'){wallet+=50;}else perks[c.id]++;lvlOpen=false;pending=0;resumeGame();}}
};reset();showCard('Birds Gone Wild'`,
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
const store = {};
const sb = {
  THREE: p,
  document: p,
  navigator: p,
  innerWidth: 1000,
  innerHeight: 700,
  devicePixelRatio: 1,
  performance,
  localStorage: {
    getItem: (k) => (store[k] === undefined ? null : store[k]),
    setItem: (k, v) => {
      store[k] = String(v);
    },
    removeItem: (k) => {
      delete store[k];
    },
    length: 0,
    key: () => null,
  },
  requestAnimationFrame: (cb) => {
    raf.push(cb);
    return 1;
  },
  addEventListener() {},
  setTimeout: (fn, ms) => {
    return 0;
  },
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
const G = sb.__G;
let t = 1000;
const DT = 1 / 60;
const step = () => {
  t += 1000 * DT;
  const cb = raf.shift();
  cb && cb(t);
};
const delay = 0.3 - 0.16 * skill,
  aimErr = 0.55 - 0.4 * skill,
  flapGap = 0.16;
function runOnce(L0) {
  G.fresh(L0);
  sb.__died = 0;
  let lastThr = [],
    hist = [],
    lastFlap = -9,
    Y = 1,
    lastDec = -9,
    frames = 0,
    best = L0;
  while (frames < 60 * 60 * 40) {
    frames++;
    G.keep();
    const s = G.S();
    if (s.shop || s.lv) G.menus();
    if (sb.__died) {
      return { reached: sb.__died };
    }
    if (s.level !== L0 && frames > 60) return { reached: s.level, secs: frames / 60 };
    if (s.state !== 'play') {
      step();
      continue;
    }
    best = Math.max(best, s.level);
    hist.push({ gt: s.gt, foes: s.foes });
    while (hist.length > 2 && hist[1].gt < s.gt - delay) hist.shift();
    const seen = hist[0],
      prev = hist[Math.max(0, hist.length - 8)];
    if (!s.paused && s.gt - lastDec > 0.1) {
      lastDec = s.gt;
      const thr = [];
      seen.foes.forEach((f, i) => {
        const d = f.dir * f.x;
        if (d < -0.6) return;
        const pv = prev.foes.find((q) => q.id === f.id);
        let v = 7;
        if (pv && pv.dir === f.dir) {
          const dv = ((pv.x - f.x) * f.dir) / Math.max(0.016, seen.gt - prev.gt || 0.1);
          if (dv > 1) v = dv;
        }
        const ta = d / v - (s.gt - seen.gt);
        if (ta < 2.6) thr.push({ h: f.h, ta: Math.max(0, ta), boss: f.boss });
      });
      lastThr = thr;
      let bestY = Y,
        bs = 1e9;
      for (let c = s.BOT + 2; c <= s.CLO - 1; c += 0.4) {
        let sc = 0.12 * Math.abs(c - s.y) + 0.03 * Math.abs(c - 5);
        thr.forEach((o) => {
          const up = o.h > c,
            r = (o.boss ? 3.2 : 2.6) + (up ? 0.8 : 0),
            g = Math.max(0, r - Math.abs(c - o.h));
          sc += ((g * g) / (o.ta + 0.25)) * 3;
        }); // keep extra room below a hawk: flaps bounce you up
        if (sc < bs) {
          bs = sc;
          bestY = c;
        }
      }
      if (s.type === 'fly' && !thr.some((o) => o.ta < 1.3)) {
        let fd = 99;
        s.flies.forEach((fl) => {
          const d = fl.dir * fl.x;
          if (d > -0.3 && d < fd) {
            fd = d;
            bestY = fl.y;
          }
        });
      }
      Y = bestY + (Math.random() * 2 - 1) * aimErr;
    }
    const danger = lastThr.some((o) => o.ta < 0.65 && o.h > s.y && o.h - s.y < 2.8);
    if (!s.paused && ((s.y < Y - 0.15 && s.vy < 1.2 && !danger) || s.y < s.BOT + 1.2) && s.gt - lastFlap > flapGap) {
      G.flap();
      lastFlap = s.gt;
    }
    step();
  }
  return { reached: best, timeout: true };
}
const R = +RUNS,
  L0 = +START;
let secs = 0;
for (let r = 0; r < R; r++) {
  const x = runOnce(L0);
  secs += x.secs || 0;
}
console.log(
  'level',
  L0,
  'boss hits per minute vs a dodging player:',
  ((sb.__BH || 0) / (secs / 60)).toFixed(2),
  '(',
  sb.__BH || 0,
  'hits in',
  (secs / 60).toFixed(1),
  'min)',
);
