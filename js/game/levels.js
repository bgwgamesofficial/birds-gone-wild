// Boss Run levels: types, goals, difficulty table, the hawk rule and bosses.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

// LEVELS: 50 short levels (about 25-60 s). Pattern in every block of 10: dodge levels, a butterfly level (x5),
// a boss level (x0, the Hawk Chief). lvD() is the difficulty: 0 on level 1 .. about 0.95 on level 50, rising in
// waves (each block of 10 builds up to its boss, the level after a boss is a breather). Fairness caps: at most
// 3 hawks per group, groups keep a 3.2 gap, every hawk locks its path >= ~0.9 s before it reaches you.
const LVL_MAX = 50;
let lvProg = 0,
  lvSpawned = 0,
  lvlDoneN = 1,
  bossOut = false;
function lvType(L) {
  L = L || level;
  return L % 10 === 0 ? 'boss' : L % 10 === 5 ? 'fly' : 'dodge';
}
function lvNeed(L) {
  L = L || level;
  const t = lvType(L);
  return t === 'boss'
    ? Math.round((8 + (L / 10) * 1.25) * (1 + 0.5 * (BOSS_K - 1)))
    : t === 'fly'
      ? (6 + Math.floor(L / 9)) * 2
      : 16 + Math.round(L * 0.5);
}
function lvGoalTxt(L) {
  L = L || level;
  const t = lvType(L),
    n = lvNeed(L);
  return t === 'boss'
    ? 'BOSS: dodge ' + bossNames(L) + ' ' + n + ' times'
    : t === 'fly'
      ? 'Catch ' + n + ' butterflies'
      : 'Get past ' + n + ' hawks';
}
// DIFFICULTY CURVE (v0.6.6, tuned with a simulated player): difficulty at levels 1,5,10,...,50, interpolated in between.
// Small saw-tooth inside each block of 10 (building to the boss) and a breather right after each boss.
const LV_TAB = [0.03, 0.22, 0.36, 0.44, 0.48, 0.5, 0.51, 0.52, 0.535, 0.55, 0.59];
function lvD() {
  const L = level;
  let d;
  if (L <= 1) d = LV_TAB[0];
  else {
    const k = Math.min(LV_TAB.length - 2, Math.floor(L / 5)),
      a = k * 5 || 1,
      b = (k + 1) * 5;
    d = LV_TAB[k] + ((LV_TAB[k + 1] - LV_TAB[k]) * (L - a)) / (b - a);
  }
  d += (((L - 1) % 10) / 9) * 0.03 - 0.015;
  if (L % 10 === 1 && L > 1) d -= 0.04;
  return Math.max(0, Math.min(1, d));
}
function lvSpd() {
  return 0.72 + 0.5 * lvD();
} // hawk crossing speed factor
function lvAdd() {
  if (state !== 'play') return;
  lvProg++;
  updXp();
  if (lvProg >= lvNeed()) levelComplete();
}
function hawkPassed(f) {
  const t = lvType();
  if ((t === 'dodge' && f.kind !== 'boss') || (t === 'boss' && f.kind === 'boss')) lvAdd();
}
function levelComplete() {
  const done = level;
  lvlDoneN = done;
  lvProg = 0;
  lvSpawned = 0;
  bossOut = false;
  hawkT = 2;
  foes.forEach((f) => scene.remove(f.g));
  foes.length = 0;
  const bonus = Math.round((3 + done * 0.6) * MM());
  wallet += bonus;
  run += bonus;
  saveW();
  if (level < LVL_MAX) level++;
  saveProg();
  updXp();
  burst(0, y, 0, 40, 0xffd23f, 6, 1.1);
  popText((done < LVL_MAX ? 'Level ' + done + ' complete!' : 'All 50 levels beaten!') + ' +$' + bonus, '#7fe7ff');
  levelHearts();
  if (done % 5 === 0) {
    pending = 1;
    showLevelUp();
  } else {
    paused = true;
    lvlOpen = true;
    lvlStage = 'wsonly';
    wsNew();
    openShop();
    sfx.level();
  }
} // STEP 1 WAVE SHOP: shop after every level, upgrade choice every 5th
function showBanner() {
  const b = document.getElementById('banner');
  if (!b || state !== 'play' || !BR) return;
  b.innerHTML = 'Level ' + level + '<small>' + lvGoalTxt() + '</small>';
  b.classList.add('on');
  clearTimeout(showBanner.t);
  showBanner.t = setTimeout(() => b.classList.remove('on'), 3300);
}
// THE 3-HAWK RULE: never more than 3 hawks coming at the player at once (boss included). A hawk counts while it
// has not crossed the lane in its current direction, or while it is turning around.
const HAWK_MAX = 5; // THE HAWK RULE: never more than 5 hawks coming at you at once (bosses included)
function lvMaxActive() {
  const t = lvType(),
    b = t === 'boss' ? bossLineup().length + 1 : 1,
    n = Math.min(HAWK_MAX, Math.max(b, 1 + Math.floor(lvD() * 4.6)));
  return t === 'fly' ? Math.min(2, n) : n;
} // butterfly levels: at most 2 hawks // 1 at a time early on, up to 5 near the end
function hawksActive() {
  let n = 0;
  foes.forEach((f) => {
    if (f.kind === 'boss' || f.tt !== undefined || f.dir * f.x > -0.4) n++;
  });
  return n;
} // the boss always holds one of the 3 places
let campT = 0,
  cloudT = 0; // anti-camping: time spent riding the clouds/ceiling, and the cloud-hawk spawn timer
function spawnCloudHawk() {
  const Dd = BR ? lvD() : Math.min(1, score / 40),
    yy = Math.max(CLO + 0.4, Math.min(CEIL - 0.1, y + Math.random() * 2 - 1));
  spawnFoe(-(sp() + 4) * (2.2 + Math.random() * 0.4), yy, 0.6 + 0.5 * Dd);
  const f = foes[foes.length - 1];
  f.kind = 'hunter';
  f.y = yy;
  f.g.position.y = yy;
  f.cloud = true;
  f.side = Math.random() < 0.5 ? -1 : 1;
  f.fq = 2.6 + Math.random() * 1.2;
  f.mind = 0.3 + Math.random();
  f.sv = 1;
  f.svT = 1;
}
// BOSSES: the Hawk Chief (big, red, hard) and the Hawk Captain (smaller, orange, easier). Boss levels get more of them.
// BOSS_K = how much harder bosses are than in v0.6.5 (1.4 = 40% harder): speed, aim, enrage and passes scale with it.
const BOSS_K = 1.4;
function bossD(L) {
  L = L || level;
  let d = Math.pow((L - 1) / 49, 1.15) * 0.88 + (((L - 1) % 10) / 9) * 0.07;
  return Math.max(0, Math.min(1, d * 1.1 + 0.03));
} // boss difficulty (steeper than lvD)
function bossLineup(L) {
  L = L || level;
  return L < 20
    ? ['chief']
    : L < 40
      ? L < 40 && L >= 20
        ? ['chief', 'captain']
        : ['chief']
      : L < 50
        ? ['chief', 'captain', 'captain']
        : ['chief', 'chief', 'captain'];
}
function bossNames(L) {
  const b = bossLineup(L);
  return b.length === 1
    ? 'the Hawk Chief'
    : b.filter((k) => k === 'chief').length +
        ' Chief' +
        (b.filter((k) => k === 'chief').length > 1 ? 's' : '') +
        ' + ' +
        b.filter((k) => k === 'captain').length +
        ' Captain' +
        (b.filter((k) => k === 'captain').length > 1 ? 's' : '');
}
function spawnBoss(cap, side, k) {
  const Dd = bossD(),
    K = BOSS_K;
  spawnFoe(-(sp() + 4) * (2.6 + (k || 0) * 1.1), y, cap ? 0.6 + 0.4 * Dd : (0.9 + 0.6 * Dd) * (1 + 0.65 * (K - 1)));
  const f = foes[foes.length - 1];
  f.kind = 'boss';
  f.cap = !!cap;
  if (side) {
    f.dir = side;
    f.x = side * Math.abs(f.x);
  }
  f.bd = Dd;
  f.bs = ((cap ? 0.95 : 1 + 0.38 * (K - 1)) * (0.72 + 0.5 * Dd)) / lvSpd();
  f.y = Math.max(BOT + 3, Math.min(CLO, y + (k || 0) * 2.5 - 2.5));
  f.amp = 0.25;
  f.fq = 2;
  f.mind = 0.5;
  f.sv = 1;
  f.svT = 1;
  f.g.scale.setScalar(cap ? 1.4 : 1.9);
  f.g.traverse((o) => {
    if (o.isMesh && o.material && o.material.emissive) o.material.emissive.setHex(cap ? 0x4a2604 : 0x4a0a04);
  });
  if (f.gl.material.color) f.gl.material.color.setHex(cap ? 0xffa030 : 0xff4030);
}
function levelHearts() {
  if (mode === 5 && BR) {
    lifePts = Math.max(lifePts, (level <= 3 ? 3 : START_HEARTS) * LIFE_SEG);
    updLife();
  }
} // each level starts with at least 2 hearts (3 on levels 1-3)
