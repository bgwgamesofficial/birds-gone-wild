// Butterflies (catch them to fill the heart bar) and the life/heart bar.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

// Butterflies (mode 5 / HAWK TEST only): small, cross the lane like hawks but steer AWAY from the player.
// Catching one fills the life bar; each full segment (LIFE_SEG points) saves you from one crash.
const flies = [],
  START_HEARTS = 2,
  LIFE_SEG = 100,
  LIFE_MAX = 300,
  FLY_GAIN_B = 12.5,
  FLY_GAIN_I = 20,
  FLYV = FVX * 0.55,
  lifeEl = document.getElementById('life');
let flyT = 3,
  lifePts = 0,
  lifeShown = '';
const FLYC = [
  [0xff8a3d, 0x2a1a10],
  [0x5ec8ff, 0x123048],
  [0xffd23f, 0x3a2a08],
  [0xff6fb5, 0x40102a],
  [0xb48cff, 0x24164a],
];
function mkFly() {
  const P = FLYC[Math.floor(Math.random() * FLYC.length)],
    g = new THREE.Group(),
    w = [];
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.035, 0.44, 6),
    new THREE.MeshBasicMaterial({ color: P[1] }),
  );
  body.rotation.x = Math.PI / 2;
  g.add(body);
  const WM = new THREE.MeshBasicMaterial({ color: P[0], side: THREE.DoubleSide });
  [-1, 1].forEach((sx) => {
    const pv = new THREE.Group();
    const a = new THREE.Mesh(new THREE.CircleGeometry(0.26, 12), WM);
    a.rotation.x = -Math.PI / 2;
    a.position.set(sx * 0.24, 0, 0.09);
    a.scale.set(1, 1.15, 1);
    pv.add(a);
    const b = new THREE.Mesh(new THREE.CircleGeometry(0.17, 10), WM);
    b.rotation.x = -Math.PI / 2;
    b.position.set(sx * 0.18, 0, -0.15);
    pv.add(b);
    g.add(pv);
    w.push(pv);
  });
  const gl = glowSprite(P[0], 1.6);
  gl.material.opacity = 0.75;
  g.add(gl);
  return { g, w, gl, col: P[0] };
}
function spawnFly() {
  const o = mkFly(),
    dir = Math.random() < 0.5 ? -1 : 1,
    yy = BOT + 3 + Math.random() * (CLO - BOT - 4);
  o.g.position.set(dir * FVX * 2.6, yy, 0);
  scene.add(o.g);
  flies.push({
    g: o.g,
    w: o.w,
    gl: o.gl,
    col: o.col,
    dir,
    x: dir * FVX * 2.6,
    y: yy,
    ph: Math.random() * 6.28,
    fq: 1.4 + Math.random() * 0.8,
  });
}
function aiFlee(f, dt) {
  // Like the hawks' aiHunt5 but reversed: predict where the player will be when the butterfly reaches the lane, and steer away.
  // On butterfly levels they are much smarter: they notice you earlier, predict your fall, pick the side with more room,
  // dart away (juke) when you line up, and hover or speed up to spoil your timing. Still catchable: you climb faster.
  const smart = BR && lvType() === 'fly',
    ax = Math.abs(f.x);
  f.hsT = 1;
  if (f.dir * f.x < -0.5 || ax > FVX * (smart ? 2.6 : 1.8)) return;
  const T = Math.min(ax / FLYV, smart ? 1.4 : 1.2),
    py = smart ? Math.max(BOT + 1, Math.min(CEIL, y + vy * T + 0.2 * GRAV * T * T)) : y + vy * T * 0.5,
    d = f.y - py;
  if (Math.abs(d) > (smart ? 4.2 : 3.2)) return;
  let away = d >= 0 ? 1 : -1;
  if (smart) {
    const up = CLO - 0.5 - f.y,
      dn = f.y - (BOT + 2.5);
    if (Math.abs(d) < 1 && (up > dn ? 1 : -1) !== away && Math.min(up, dn) < 2.5) away = -away;
  } // pick the roomier side
  if (away > 0 && f.y > Math.min(CEIL - 1.6, CLO - 0.3)) away = -1;
  else if (away < 0 && f.y < BOT + 3.2) away = 1; // cornered: dodge the other way
  const vm = (smart ? 2.4 + 2 * AI.skill : 1.6 + 1.4 * AI.skill) * dt;
  let dy = away * vm;
  if (smart) {
    f.jk = (f.jk || 0) - dt;
    if (f.jk <= 0 && ax < 3.6 && Math.abs(d) < 1.6 && Math.random() < dt * 5) {
      f.jk = 0.7;
      f.jt = 0.22;
      f.jv = (Math.random() < 0.65 ? away : -away) * 7;
    }
    if (f.jt > 0) {
      f.jt -= dt;
      dy = f.jv * dt;
    }
    f.hsT = ax < 4.5 && Math.abs(d) < 2 ? (f.hv = f.hv === undefined ? (Math.random() < 0.5 ? 0.45 : 1.35) : f.hv) : 1;
  } // hover or rush while you are lined up
  f.y = Math.max(BOT + 2.5, Math.min(CEIL - 0.8, f.y + dy));
}
function updLife() {
  const on = mode === 5,
    k = on + '|' + lifePts;
  if (k === lifeShown) return;
  lifeShown = k;
  lifeEl.classList.toggle('on', on);
  lifeEl.classList.toggle('full', lifePts >= LIFE_MAX);
  lifeEl.querySelectorAll('.seg i').forEach((el, i) => {
    el.style.width = Math.max(0, Math.min(1, (lifePts - i * LIFE_SEG) / LIFE_SEG)) * 100 + '%';
  });
}
function catchFly(f) {
  if (BR && lvType() === 'fly') lvAdd();
  const was = Math.floor(lifePts / LIFE_SEG);
  lifePts = Math.min(LIFE_MAX, lifePts + (BR ? FLY_GAIN_B : FLY_GAIN_I)); // Boss Run: 8 butterflies per heart; Infinite Run: 5
  sfx.coin();
  burst(f.x, f.fy, 0, 16, f.col, 3.5, 0.6);
  if (Math.floor(lifePts / LIFE_SEG) > was) popText('+1 Life!', '#ff7aa8');
  else popText(lifePts >= LIFE_MAX ? 'Life full' : '+Life', '#ffa3c4');
  updLife();
}
function clearFlies() {
  flies.forEach((f) => scene.remove(f.g));
  flies.length = 0;
}
