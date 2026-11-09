// Classic modes 1-4 only (pipes). Unreachable since v0.5.4, kept for the classic-modes branch.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

function makePipe(z) {
  const g = new THREE.Group();
  const low = BOT + GAP / 2 + 1.2,
    high = TOP - GAP / 2 - 1.2;
  const Mo = MODES[mode - 1],
    rj = (Math.random() * 2 - 1) * Mo.dj;
  let dj2 = rj;
  if (Mo.ai > 0) {
    let sg = AI.y > lastBase ? -1 : 1;
    if (sg === lastDir && dirRun >= 1) sg = -sg;
    dj2 = Math.abs(rj) * sg * (0.55 + 0.45 * Mo.ai) + rj * (1 - Mo.ai) * 0.35;
    dirRun = sg === lastDir ? dirRun + 1 : 0;
    lastDir = sg;
  }
  dj2 += ((low + high) / 2 - lastBase) * 0.18;
  const base = Math.max(low, Math.min(high, lastBase + dj2));
  lastBase = base;
  const m0 = mats[Math.floor(Math.random() * mats.length)],
    m = { p: m0.p.clone(), c: m0.c.clone() };
  m.p.transparent = m.c.transparent = true;
  [m.p, m.c].forEach((q) => {
    q.emissive.copy(q.color);
    q.emissiveMap = q.map;
    q.emissiveIntensity = 0;
  });
  const t = new THREE.Mesh(gTube, m.p);
  t.position.y = GAP / 2 + 15.4;
  const tc = new THREE.Mesh(gRim, m.c);
  tc.position.y = GAP / 2 + 0.4;
  const b = new THREE.Mesh(gTube, m.p);
  b.position.y = -GAP / 2 - 15.4;
  const bc = new THREE.Mesh(gRim, m.c);
  bc.position.y = -GAP / 2 - 0.4;
  const ht = new THREE.Mesh(gHole, holeMat);
  ht.rotation.x = Math.PI / 2;
  ht.position.y = GAP / 2 - 0.012;
  const hb = new THREE.Mesh(gHole, holeMat);
  hb.rotation.x = -Math.PI / 2;
  hb.position.y = -GAP / 2 + 0.012;
  g.add(t, tc, b, bc, ht, hb);
  [t, tc, b, bc].forEach((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
  });
  const coins = [];
  [
    [0, 0],
    [-6, 1.2],
    [-12, 1.2],
  ].forEach(([lz, dy]) => {
    const c = mkCoin();
    const gs = new THREE.Sprite(glowMat);
    gs.scale.set(3.4, 3.4, 1);
    c.add(gs);
    c.position.set(0, dy, lz);
    g.add(c);
    coins.push({ m: c, lz, got: false });
  });
  g.position.set(0, base, z);
  scene.add(g);
  return {
    g,
    base,
    gy: base,
    z,
    coins,
    pm: m,
    holes: [ht, hb],
    k: Math.random() < 0.25 ? 0 : 0.5 + Math.random() * 0.5,
    ph: Math.random() * 6.28,
    fq: 0.8 + Math.random() * 0.9,
    scored: false,
  };
}

// moving pipes + coin pickup
function updPipe(p) {
  const fo = Math.min(1, Math.max(0, 1 - (p.z - 2.8) / 3.4));
  p.pm.p.opacity = p.pm.c.opacity = fo;
  p.holes[0].visible = p.holes[1].visible = fo > 0.99;
  p.g.visible = fo > 0.01;
  const amp = Math.min(1, Math.max(0, (score - 2) / 12)) * 3.2 * p.k * MODES[mode - 1].mv;
  let gy = p.base + Math.sin(gt * p.fq + p.ph) * amp;
  gy = Math.max(BOT + GAP / 2 + 0.6, Math.min(TOP - GAP / 2 - 0.6, gy));
  p.gy = gy;
  p.g.position.y = gy;
  p.coins.forEach((c) => {
    if (c.got) return;
    const m = c.m;
    const rng = fxOn('magnet') ? 14 : perks.pull * 3.5;
    if (rng > 0) {
      const pz = p.z + m.position.z;
      if (pz > -rng && pz < 3) {
        const k = 1 - Math.exp(-7 * dtg);
        m.position.y += (y - gy - m.position.y) * k;
        m.position.z += (-p.z - m.position.z) * k;
      }
    }
    const cz = p.z + m.position.z;
    if (Math.abs(cz) < 1.6 && Math.abs(y - (gy + m.position.y)) < 1.9) {
      c.got = true;
      m.visible = false;
      const v = 1.5 * MM() * (fxOn('double') ? 2 : 1) * (Math.random() < perks.lucky * 0.15 ? 2 : 1);
      wallet += v;
      run += v;
      saveW();
      sfx.coin();
      popText('+$' + fm(v));
      gainXp(1);
      wEl.classList.remove('bump');
      void wEl.offsetWidth;
      wEl.classList.add('bump');
      burst(0, gy + m.position.y, cz, 14, 0xffd23f, 5, 0.6);
    }
  });
}
