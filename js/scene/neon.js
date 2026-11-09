// The random NEON sky cycle: colours, grid, road light strips and prop tint.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

// NEON cycle: a random third "time of day". neo (0..1) fades it in/out over a few seconds.
let neoPulse = 0,
  neo = 0,
  neoT = 0,
  neoUntil = 0,
  neoNext = 60;
const cNeoTop = new THREE.Color(0x06001a),
  cNeoBot = new THREE.Color(0x5a0b6e),
  cNeoFog = new THREE.Color(0x2a0748),
  cNeoRidge = new THREE.Color(0x14031f),
  cNeoHemi = new THREE.Color(0.8, 0.55, 1),
  cNeoSun = new THREE.Color(1, 0.35, 0.9),
  cWhite = new THREE.Color(1, 1, 1),
  cFF = new THREE.Color(0xcfff7a),
  cFFNeo = new THREE.Color(0x3ff6ff),
  cBank = new THREE.Color(0.75, 0.3, 1),
  cNeoCloud = new THREE.Color(0.2, 0.07, 0.32);
const gridTex = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = '#000';
  x.fillRect(0, 0, 128, 128);
  x.shadowColor = '#fff';
  x.shadowBlur = 10;
  x.strokeStyle = '#fff';
  x.lineWidth = 5;
  x.strokeRect(-2, -2, 132, 132);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
})();
ground.material.emissiveMap = gridTex;
ground.material.emissive = new THREE.Color(0);
path.material.emissiveMap = gridTex;
path.material.emissive = new THREE.Color(0);
const neonSun = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d'),
    g = x.createLinearGradient(0, 20, 0, 236);
  g.addColorStop(0, '#fff27a');
  g.addColorStop(0.45, '#ff8a3d');
  g.addColorStop(0.75, '#ff2fa8');
  g.addColorStop(1, '#a21cff');
  x.fillStyle = g;
  x.beginPath();
  x.arc(128, 128, 108, 0, 6.283);
  x.fill();
  x.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 7; i++) {
    const yy = 140 + i * 14 + i * i * 0.6;
    x.fillRect(0, yy, 256, 2 + i * 1.4);
  }
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(150, 150),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(c),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      fog: false,
    }),
  );
  m.position.set(0, 34, -292);
  m.renderOrder = -8;
  m.add(glowSprite(0xff3fb0, 330));
  m.children[0].material.opacity = 0;
  return m;
})();
scene.add(neonSun);
const edgeMat = new THREE.MeshBasicMaterial({
  color: 0x5ff8ff,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});
const roadEdges = [-7.05, 7.05].map((x) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 400, 1, 100), edgeMat);
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, -5.95, 0);
  m.visible = false;
  scene.add(m);
  bends.push(mkBend(m));
  return m;
});
const NEONP = [new THREE.Color(1, 0.2, 0.8), new THREE.Color(0.25, 0.9, 1), new THREE.Color(0.75, 0.3, 1)],
  cNeoDark = new THREE.Color(0.05, 0.02, 0.1);
const neonMats = (() => {
  const L = [];
  const add = (m, i) => {
    if (m && !L.some((q) => q.m === m))
      L.push({ m, c: m.color.clone(), e: m.emissive ? m.emissive.clone() : null, g: NEONP[i % 3] });
  };
  leafM.forEach(add);
  leafL.forEach(add);
  [trunkM, rockM, stemM, postM].forEach((m, i) => add(m, i + 1));
  headM.forEach((m, i) => add(m, i));
  return L;
})();
let neonMatK = -1;
function neonMatsApply(k) {
  const kk = Math.round(k * 50) / 50;
  if (kk === neonMatK) return;
  neonMatK = kk;
  neonMats.forEach((o) => {
    o.m.color.copy(o.c).lerp(cNeoDark, kk * 0.85);
    if (o.e) o.m.emissive.copy(o.e).lerp(o.g, kk * 0.55);
  });
}
function neonTick(dt) {
  if (state === 'play') {
    if (!neoT && gt > neoNext) {
      neoT = 1;
      neoUntil = gt + 25 + Math.random() * 20;
    } else if (neoT && gt > neoUntil) {
      neoT = 0;
      neoNext = gt + 40 + Math.random() * 100;
    }
  }
  neo += (neoT - neo) * (1 - Math.exp(-0.7 * dt));
  if (neo < 0.001) neo = 0;
}
function neonReset() {
  neoT = Math.random() < 0.15 ? 1 : 0;
  neo = neoT;
  neoUntil = 25 + Math.random() * 20;
  neoNext = 30 + Math.random() * 90;
}
function neonApply() {
  const k = neo;
  neonSun.material.opacity = k;
  neonSun.children[0].material.opacity = k * 0.55;
  neonSun.visible = k > 0;
  sunM.visible = moonM.visible = k < 0.6;
  skyU.hk.value = k * (0.85 + 0.25 * neoPulse);
  edgeMat.opacity = k * (0.75 + 0.25 * neoPulse);
  roadEdges.forEach((m) => {
    m.visible = k > 0;
  });
  neonMatsApply(k);
  if (k <= 0) {
    cloudMat.opacity = 0.95;
    ground.material.emissive.setRGB(0, 0, 0);
    path.material.emissive.setRGB(0, 0, 0);
    ground.material.color.copy(cWhite);
    path.material.color.copy(cWhite);
    ffMat.color.copy(cFF);
    if (bloomPass) {
      bloomPass.strength = 0.5;
      bloomPass.threshold = 0.93;
    }
    return;
  }
  skyU.top.value.lerp(cNeoTop, k);
  skyU.bot.value.lerp(cNeoBot, k);
  scene.background.copy(skyU.bot.value);
  scene.fog.color.lerp(cNeoFog, k);

  hemi.color.lerp(cNeoHemi, k);
  hemi.intensity += (0.5 - hemi.intensity) * k;
  sun.color.lerp(cNeoSun, k);
  sun.intensity += (0.4 - sun.intensity) * k;
  ground.material.color.setRGB(1 - 0.82 * k, 1 - 0.88 * k, 1 - 0.7 * k);
  path.material.color.setRGB(1 - 0.75 * k, 1 - 0.8 * k, 1 - 0.6 * k);
  {
    const pk = k * (0.8 + 0.4 * neoPulse);
    ground.material.emissive.setRGB(0.95 * pk, 0.15 * pk, 0.85 * pk);
    path.material.emissive.setRGB(0.1 * pk, 0.85 * pk, 1 * pk);
  }
  cloudMat.color.lerp(cNeoCloud, k);
  cloudMat.opacity = 0.95 * (1 - 0.65 * k);
  ffMat.color.copy(cFF).lerp(cFFNeo, k);
  if (bloomPass) {
    bloomPass.strength = 0.5 + 0.45 * k;
    bloomPass.threshold = 0.93 - 0.15 * k;
  }
}
