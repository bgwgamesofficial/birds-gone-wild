// Particle bursts, the bird glow, the hawk warning markers ("!") and fireflies.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

// particles
const PN = 420,
  pPos = new Float32Array(PN * 3),
  pBase = new Float32Array(PN * 3),
  pCol = new Float32Array(PN * 3),
  pVel = new Float32Array(PN * 3),
  pLife = new Float32Array(PN),
  pMax = new Float32Array(PN);
let pHead = 0;
for (let i = 0; i < PN; i++) pPos[i * 3 + 1] = -999;
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
const pTexSoft = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.5, 'rgba(255,255,255,.5)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();
const pPts = new THREE.Points(
  pGeo,
  new THREE.PointsMaterial({
    size: 0.55,
    map: pTexSoft,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }),
);
pPts.frustumCulled = false;
scene.add(pPts);
function burst(x, y, z, n, hex, spd, life) {
  n = Math.round(n * (S.particles === 'off' ? 0 : S.particles === 'low' ? 0.5 : 1));
  const c = new THREE.Color(hex);
  for (let i = 0; i < n; i++) {
    const k = pHead++ % PN,
      a = Math.random() * 6.283,
      b = Math.random() * 3.1416 - 1.5708,
      v = spd * (0.35 + Math.random() * 0.65);
    pPos[k * 3] = x;
    pPos[k * 3 + 1] = y;
    pPos[k * 3 + 2] = z;
    pVel[k * 3] = Math.cos(a) * Math.cos(b) * v;
    pVel[k * 3 + 1] = Math.sin(b) * v;
    pVel[k * 3 + 2] = Math.sin(a) * Math.cos(b) * v;
    pBase[k * 3] = c.r;
    pBase[k * 3 + 1] = c.g;
    pBase[k * 3 + 2] = c.b;
    pLife[k] = pMax[k] = life * (0.6 + Math.random() * 0.4);
  }
}
function updP(dt, wz) {
  for (let k = 0; k < PN; k++) {
    if (pLife[k] <= 0) {
      pCol[k * 3] = pCol[k * 3 + 1] = pCol[k * 3 + 2] = 0;
      continue;
    }
    pLife[k] -= dt;
    const f = Math.max(0, pLife[k] / pMax[k]);
    pVel[k * 3 + 1] -= 5 * dt;
    pPos[k * 3] += pVel[k * 3] * dt;
    pPos[k * 3 + 1] += pVel[k * 3 + 1] * dt;
    pPos[k * 3 + 2] += (pVel[k * 3 + 2] + wz) * dt;
    pCol[k * 3] = pBase[k * 3] * f;
    pCol[k * 3 + 1] = pBase[k * 3 + 1] * f;
    pCol[k * 3 + 2] = pBase[k * 3 + 2] * f;
  }
  pGeo.attributes.position.needsUpdate = true;
  pGeo.attributes.color.needsUpdate = true;
}
const birdGlow = glowSprite(0xcfe8ff, 6.5);
birdGlow.position.set(0, 0.15, -0.2);
bird.add(birdGlow);
const birdL = new THREE.PointLight(0xdfeeff, 0, 10, 2);
bird.add(birdL);
const bTint = new THREE.Color(0x7d8cc8),
  birdMats = [];
bird.traverse((o) => {
  if (o.isMesh && o.material && o.material.emissive && birdMats.indexOf(o.material) < 0) birdMats.push(o.material);
});
const warnEl = document.getElementById('warn'),
  warn2 = document.getElementById('warn2'),
  wpv = new THREE.Vector3();
const FF = 70,
  ffGeo = new THREE.BufferGeometry(),
  ffPos = new Float32Array(FF * 3),
  ffSeed = [];
for (let i = 0; i < FF; i++) {
  ffPos[i * 3] = (Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 24);
  ffPos[i * 3 + 1] = -5 + Math.random() * 7;
  ffPos[i * 3 + 2] = -Math.random() * 90;
  ffSeed.push(Math.random() * 6.28);
}
ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPos, 3));
const ffMat = new THREE.PointsMaterial({
  size: 0.5,
  map: pTexSoft,
  color: 0xcfff7a,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});
const ffPts = new THREE.Points(ffGeo, ffMat);
ffPts.frustumCulled = false;
scene.add(ffPts);
