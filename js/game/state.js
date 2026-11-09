// Game modes (Infinite Run / Boss Run), run state variables, saving/loading progress, difficulty modes.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

// state
// GAME MODES: BR=false -> "Infinite Run" (the original endless game, exactly as live in v0.5.4); BR=true -> "Boss Run" (50 levels, hearts, bosses).
// Each keeps its own coins, progress and best score.
let BR = false;
try {
  BR = localStorage.getItem('flappygame') === 'boss';
} catch (e) {}
function progKey() {
  return BR ? 'flappyboss' : 'flappyprog';
}
function wkey() {
  return BR ? 'flappywallet_boss' : 'flappywallet';
}
let vb = 0,
  viewSide = false;
try {
  viewSide = localStorage.getItem('flappyview') === 'side';
} catch (e) {}
let wsOff = [],
  wsRr = 0; // STEP 1 WAVE SHOP (Boss Run): the shop's current offers and rerolls used in this shop
let used = {};
let lvlStage = 'shop',
  lvlSel = null,
  lvlCh = [];
let state = 'ready',
  y = 1,
  camY = 1,
  vy = 0,
  gt = 0,
  run = 0,
  wallet = 0,
  fx = {},
  ghost = 0,
  shopOpen = false,
  dtg = 0.016,
  revives = 0,
  offer = false,
  hold = false,
  incT = 0,
  setOpen = false,
  paused = false,
  lvlOpen = false,
  level = 1,
  xp = 0,
  pending = 0,
  perks = { pull: 0, lucky: 0, wings: 0, steady: 0, slim: 0, learner: 0, guard: 0 },
  inv = { shield: 0, magnet: 0, double: 0, slow: 0, feather: 0 },
  score = 0,
  best = 0,
  speed = 0,
  shake = 0,
  tilt = 0,
  time = 0;
try {
  best = +localStorage.getItem('flappyfpv') || 0;
} catch (e) {}
try {
  Object.assign(inv, JSON.parse(localStorage.getItem('flappyinv') || '{}'));
} catch (e) {}
function loadProg() {
  Object.keys(perks).forEach((k) => {
    perks[k] = 0;
  });
  level = 1;
  xp = 0;
  try {
    const P = JSON.parse(localStorage.getItem(progKey()) || '{}');
    level = BR ? Math.max(1, Math.min(50, P.stage || 1)) : Math.max(1, P.level || 1);
    xp = P.xp || 0;
    Object.assign(perks, P.perks || {});
  } catch (e) {}
  try {
    wallet = +localStorage.getItem(wkey()) || 0;
  } catch (e) {}
}
// Every game starts from nothing: $0, level 1, no upgrades, no leftover shop items (both modes). Only best scores,
// settings, bird colour and the chosen mode are remembered between games.
function freshRun() {
  wsOff = [];
  wsRr = 0;
  wallet = 0;
  level = 1;
  xp = 0;
  pending = 0;
  revives = 0;
  Object.keys(perks).forEach((k) => {
    perks[k] = 0;
  });
  Object.keys(inv).forEach((k) => {
    inv[k] = 0;
  });
  try {
    localStorage.setItem(wkey(), 0);
  } catch (e) {}
  saveProg();
  saveInv();
}
loadProg();
freshRun();
const hud = document.getElementById('hud'),
  msg = document.getElementById('msg'),
  card = document.getElementById('card'),
  bestEl = document.getElementById('best');
const GRAV = -24,
  FLAP = 9,
  SPEED = 9;
const MODES = [
  { n: 'Relaxed', s: 0.7, gap: 10, f: 0, m: 0.5, mv: 0, dj: 3, ai: 0, hb: -0.12 },
  { n: 'Normal', s: 0.9, gap: 8.4, f: 0.6, m: 1, mv: 0.5, dj: 4, ai: 0.25, hb: -0.06 },
  { n: 'Hard', s: 1.05, gap: 7, f: 1.1, m: 1.6, mv: 1, dj: 5, ai: 0.5, hb: 0 },
  { n: 'Expert', s: 1.25, gap: 5.8, f: 1.7, m: 2.5, mv: 1.4, dj: 5.5, ai: 0.75, hb: 0 },
  { n: 'Insane', s: 1.5, gap: 4.8, f: 2.4, m: 4, mv: 1.8, dj: 6, ai: 1, hb: 0.03 },
];
const AI = { y: 1, skill: 0.5 };
const HAB = new Array(10).fill(0);
let mode = 5; // The game is level 5 ("HAWK TEST") only for now. Levels 1-4 are kept on the classic-modes branch.
try {
  best = +localStorage.getItem(bkey()) || 0;
} catch (e) {}
setCeil();
function MM() {
  return MODES[mode - 1].m;
}
function pr(it) {
  return Math.round(it.price * MM());
}
function bkey() {
  return BR ? 'flappyfpv_boss' : 'flappyfpv' + (mode === 2 ? '' : '_m' + mode);
}
function resetBest() {
  // clears the saved best score (all old difficulty modes too)
  try {
    const ks = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf('flappyfpv') === 0) ks.push(k);
    }
    ks.forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem('flappyfpv');
  } catch (e) {}
  best = 0;
  const bs = card.querySelector('#best');
  if (bs) bs.innerHTML = 'Best: 0 &nbsp; Wallet: <b class="wv">$' + fm(wallet) + '</b>';
}
function setCeil() {
  CEIL = mode === 5 ? 20 : 16;
  CLO = mode === 5 ? 16 : 9.5;
  banks.forEach((b) => bankReset(b, false));
}
function applyMode() {
  setCeil();
  try {
    setView(viewSide);
  } catch (e) {}
  GAP = MODES[mode - 1].gap;
  try {
    best = +localStorage.getItem(bkey()) || 0;
  } catch (e) {}
}
function modeCap() {
  const M = MODES[mode - 1];
  return (
    M.n +
    ' - rewards x' +
    M.m +
    (M.ai ? ' - AI ' + Math.round(M.ai * 100) + '%' : ' - no AI') +
    (mode === 5 ? ' - hawks only (HAWK TEST)' : '')
  );
}
applyMode();
function saveInv() {
  try {
    localStorage.setItem('flappyinv', JSON.stringify(inv));
  } catch (e) {}
}
function saveProg() {
  try {
    localStorage.setItem(progKey(), JSON.stringify(BR ? { stage: level, xp, perks } : { level, xp, perks }));
  } catch (e) {}
}
