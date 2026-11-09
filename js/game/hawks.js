// Hawk models and hawk AI (hunting, feints, U-turns), hits and spawning.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

const HAWK = [
  { b: 0x7a4a26, w: 0x5e3a1c, t: 0x9a5a2a, v: 0xf0e0c4, k: 0xf2c230 },
  { b: 0x5a6470, w: 0x434c57, t: 0x7c8794, v: 0xe8eaee, k: 0xf2c230 },
  { b: 0xb5622e, w: 0x8c4720, t: 0xd9823a, v: 0xf6e7cf, k: 0xf2c230 },
  { b: 0x3a2a22, w: 0x2a1d17, t: 0x5a4032, v: 0xcbb9a6, k: 0xf2c230 },
  { b: 0xc79a4a, w: 0x9a7432, t: 0xe2b865, v: 0xfff1d6, k: 0xf2c230 },
];
function mkFoe() {
  const P = HAWK[Math.floor(Math.random() * HAWK.length)],
    g = new THREE.Group(),
    w = [];
  const M = (c) => new THREE.MeshPhongMaterial({ color: c, shininess: 25, specular: 0x222222, emissive: 0x1c0f08 }),
    K = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 18, 14), M(P.b));
  body.scale.set(0.95, 0.9, 1.4);
  g.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.4, 14, 10), M(P.v));
  belly.position.set(0, -0.18, 0.12);
  belly.scale.set(0.95, 0.8, 1.2);
  g.add(belly);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), M(P.b));
  head.position.set(0, 0.2, 0.6);
  g.add(head);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.3, 10), M(P.k));
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 0.14, 0.92);
  g.add(beak);
  const hook = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 8), M(0x333333));
  hook.rotation.x = Math.PI;
  hook.position.set(0, 0.06, 1.04);
  g.add(hook);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.8, 4), M(P.t));
  tail.rotation.x = -Math.PI / 2;
  tail.position.set(0, 0.02, -0.95);
  tail.scale.set(1.6, 1, 0.3);
  g.add(tail);
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.1), M(P.w));
  band.position.set(0, 0.05, -1.05);
  g.add(band);
  [-1, 1].forEach((sx) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffe14a }));
    e.position.set(sx * 0.17, 0.27, 0.8);
    g.add(e);
    const pu = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), K);
    pu.position.set(sx * 0.19, 0.27, 0.86);
    g.add(pu);
    const br = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.035, 0.05), K);
    br.position.set(sx * 0.17, 0.35, 0.82);
    br.rotation.z = sx * 0.5;
    g.add(br);
    const pv = new THREE.Group();
    pv.position.set(sx * 0.4, 0.12, 0.1);
    const wg = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 8), M(P.w));
    wg.scale.set(1, 0.12, 0.75);
    wg.position.x = sx * 0.5;
    pv.add(wg);
    g.add(pv);
    w.push(pv);
  });
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  const gl = glowSprite(0xff9a3a, 3.2);
  gl.material.depthTest = false;
  gl.material.opacity = 0.9;
  gl.renderOrder = 20;
  gl.position.z = 0.2;
  g.add(gl);
  return { g, w, gl };
}
function foeHit(f) {
  if (gt < ghost) return;
  f.hit = true;
  if (fx.shield) {
    die();
    return;
  }
  const amt = Math.max(1, Math.round((mode === 5 && BR ? 4 + level * 1.2 : 5 + Math.floor(score / 4)) * MM()));
  if (mode === 5 && BR) {
    // HEARTS: every hit steals coins (if you have any) AND costs a heart; no hearts left = game over
    const took = Math.min(wallet, amt);
    if (took > 0) {
      wallet -= took;
      saveW();
      popText('-$' + fm(took) + ' stolen!', '#ff6b5a');
    }
    sfx.steal();
    burst(0, y, 0, 20, 0xff6b5a, 5, 0.7);
    die();
    return;
  }
  if (wallet >= amt) {
    wallet -= amt;
    saveW();
    ghost = gt + 1;
    shake = 0.4;
    sfx.steal();
    popText('-$' + amt + ' stolen!', '#ff6b5a');
    burst(0, y, 0, 20, 0xff6b5a, 5, 0.7);
  } else die();
}
function foeSlot(z0) {
  let bz = z0,
    bc = -1;
  for (let k = -4; k <= 4; k++) {
    const z = z0 + k * 2.5,
      T = -z / (sp() + 4);
    let cl = 99;
    pipes.forEach((p) => {
      const r = (((p.z + sp() * T) % SPACING) + SPACING) % SPACING;
      cl = Math.min(cl, r, SPACING - r);
    });
    if (cl > bc) {
      bc = cl;
      bz = z;
    }
  }
  return bz;
}
function HS() {
  return (fxOn('slow') && mode === 5 ? 0.55 : 1) * (1 - 0.06 * perks.steady * (mode === 5 ? 1 : 0));
}
function habitY() {
  let bi = 0;
  for (let i = 1; i < HAB.length; i++) if (HAB[i] > HAB[bi]) bi = i;
  return BOT + ((bi + 0.5) * (CEIL - BOT)) / HAB.length;
}
function aiHuntInf(f, dt) {
  // Infinite Run hawks: as live v0.5.4, plus the anti-camping fix (v0.6.9)
  if (f.hit || f.dir * f.x < 0 || fxOn('magnet')) return;
  const ax = Math.abs(f.x);
  if (ax < FVX * 1.4) return; // locks its line ~1.4 s before crossing (was 1.15)
  const T = Math.min(ax / (FVX * HS()), 1.1),
    riding = campT > 0.8 || y > CEIL - 0.6; // riding = staying up in the clouds / at the ceiling
  const py = riding ? y : Math.max(BOT + 1.5, Math.min(CEIL - 1.2, y + vy * T * 0.6));
  let tgt = riding || f.cloud ? py : 0.5 * py + 0.3 * habitY() + 0.2 * AI.y; // campers: aim straight at the bird
  if (f.kind === 'feint' && ax > FVX * 1.8) tgt = py + f.side * 3.5;
  tgt = Math.max(BOT + 3, Math.min(riding || f.cloud ? CEIL - 0.2 : CEIL - 0.8, tgt));
  const vm = (1.7 + 2.6 * f.hunt * (0.6 + 0.4 * AI.skill)) * dt; // was 2+3.2*...
  f.y += Math.max(-vm, Math.min(vm, tgt - f.y));
}
function aiHunt5(f, dt) {
  if (!BR) return aiHuntInf(f, dt);
  // Independent hawks (mode 5): every hawk keeps changing its mind on its own (f.mind timer): hunt you, climb above,
  // drop below, feint, hover (stall) or burst ahead. Each predicts where the toucan will be (gravity included).
  // At the lock distance it commits to a crossing height f.ty (shown by the "!"), and may change its mind ONE more
  // time before it gets too close (the "!" moves with it). Speed changes stop near the lock so you can still react.
  if (f.hit || f.dir * f.x < 0 || fxOn('magnet')) return;
  const D = f.bd !== undefined ? f.bd : lvD(),
    ax = Math.abs(f.x),
    spd = FVX * HS() * lvSpd() * (f.kind === 'boss' ? f.bs || 1 : 1) * (f.sv || 1),
    lockX = FVX * (1.5 - 0.45 * D); // locks ~2 s before reaching you on level 1, ~0.9 s on level 50
  const T0 = Math.min(ax / Math.max(1, spd), 1.6),
    riding = campT > 0.8 || y > CEIL - 0.6,
    pyNow = riding ? y : Math.max(BOT + 1.5, Math.min(CEIL, y + vy * T0 + 0.25 * GRAV * T0 * T0)); // a bird riding the clouds/ceiling stays up there
  if (ax < lockX) {
    f.svT = 1;
    if (f.ty === undefined) f.ty = Math.max(BOT + 3, Math.min(CEIL - 0.2, f.y));
    if (!f.reaimed && ax > lockX * 0.55 && Math.random() < dt * (0.4 + 0.9 * D)) {
      f.reaimed = true;
      f.ty = Math.max(BOT + 3, Math.min(CEIL - 0.2, f.ty + Math.max(-2.5, Math.min(2.5, pyNow - f.ty))));
      f.warned = false;
    } // late change of mind
    const Tl = Math.max(0.08, ax / spd),
      v = (f.ty - f.y) / Tl,
      mv = 6.5 * dt;
    f.y += Math.max(-mv, Math.min(mv, v * dt));
    return;
  }
  f.ty = undefined;
  f.mind = (f.mind === undefined ? Math.random() : f.mind) - dt;
  if (f.mind <= 0) {
    f.mind = 0.45 + Math.random() * 1.2;
    const r = Math.random();
    f.act =
      r < 0.34 ? 'hunt' : r < 0.48 ? 'high' : r < 0.62 ? 'low' : r < 0.76 ? 'feint' : r < 0.88 ? 'stall' : 'burst';
    f.fs = Math.random() < 0.5 ? -1 : 1;
  }
  const near = ax < lockX * 1.35;
  f.svT = near ? 1 : f.act === 'stall' ? 0.45 : f.act === 'burst' ? 1.5 : 1;
  let tgt = f.cloud || riding ? pyNow : 0.55 * pyNow + 0.25 * habitY() + 0.2 * AI.y; // cloud hawks and campers: aim straight at the bird
  if (f.cut) {
    const esc = vy > 2 ? 1 : vy < -2 ? -1 : f.side || 1;
    tgt = pyNow + esc * 2.6;
  } // group partner: block the way you are heading
  const far = Math.max(0, Math.min(1, (ax - lockX) / (FVX * 1.2)));
  if (f.act === 'high') tgt += 3 * far;
  else if (f.act === 'low') tgt -= 3 * far;
  else if (f.act === 'feint' || (f.kind === 'feint' && ax > FVX * 1.8))
    tgt = pyNow + (f.fs || f.side || 1) * 3.5 * Math.max(far, 0.3);
  tgt += (f.sw || 0) * far;
  tgt = Math.max(BOT + 3, Math.min(CEIL - 0.2, tgt)); // hawks can now fly right up to the ceiling
  const vm = (1.7 + 2.6 * f.hunt * (0.6 + 0.4 * AI.skill)) * dt;
  f.y += Math.max(-vm, Math.min(vm, tgt - f.y));
}
function aiHunt(f, dt) {
  if (mode === 5) return aiHunt5(f, dt);
  if (!f.hunt || f.hit || f.dir * f.x < FVX * 1.15 || (mode === 5 && fxOn('magnet'))) return;
  const tArr = Math.abs(f.x) / FVX;
  let tgt = 0.55 * (y + vy * 0.3) + 0.45 * AI.y,
    best = null,
    bd = 99;
  pipes.forEach((p) => {
    const az = Math.abs(p.z + sp() * tArr);
    if (az < bd) {
      bd = az;
      best = p;
    }
  });
  if (best && bd < 5) tgt = 0.45 * best.base + 0.55 * tgt;
  tgt = Math.max(BOT + 1.5, Math.min(CEIL - 1.2, tgt));
  const vm = (1.4 + 3.2 * f.hunt) * dt;
  f.y += Math.max(-vm, Math.min(vm, tgt - f.y));
}
function spawnFoe(z, by, hunt) {
  const o = mkFoe();
  const y0 = Math.max(
    BOT + 1.5,
    Math.min(CEIL - 1.2, by + (Math.random() < 0.5 ? -1 : 1) * (1.6 + Math.random() * 1.6)),
  );
  o.g.scale.setScalar(0.9);
  o.g.position.set(0, y0, z);
  scene.add(o.g);
  foes.push({ g: o.g, w: o.w, gl: o.gl, hunt: hunt || 0, z, y: y0, ph: Math.random() * 6.28, dir: 0 });
  const f0 = foes[foes.length - 1];
  f0.dir = Math.random() < 0.5 ? -1 : 1;
  f0.x = ((f0.dir * -z) / (sp() + 4)) * FVX;
}
