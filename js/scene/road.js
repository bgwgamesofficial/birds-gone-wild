// Ground, road path and the winding road bend (Boss Run / Infinite Run world).
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

// ground & ceiling
const gTex = mkTex('#79c944', [30, 40], (x) => {
  x.fillStyle = '#62b536';
  x.fillRect(0, 128, 256, 128);
  for (let i = 0; i < 1000; i++) {
    x.fillStyle = Math.random() < 0.5 ? 'rgba(40,110,30,.35)' : 'rgba(180,235,100,.35)';
    x.fillRect(Math.random() * 256, Math.random() * 256, 2, 3 + Math.random() * 4);
  }
  x.strokeStyle = 'rgba(30,90,25,.55)';
  x.lineWidth = 1;
  for (let i = 0; i < 180; i++) {
    const a = Math.random() * 256,
      b = Math.random() * 256;
    x.beginPath();
    x.moveTo(a, b);
    x.lineTo(a + Math.random() * 3 - 1.5, b - 5 - Math.random() * 6);
    x.stroke();
  }
  for (let i = 0; i < 6; i++) {
    x.fillStyle = ['#fff', '#ffd23f', '#ff7aa8'][i % 3];
    x.beginPath();
    x.arc(Math.random() * 256, Math.random() * 256, 2, 0, 6.3);
    x.fill();
  }
});
const pTex = mkTex('#c9a26b', [1, 57], (x) => {
  x.fillStyle = '#bd945c';
  x.fillRect(0, 128, 256, 128);
  for (let i = 0; i < 500; i++) {
    x.fillStyle = Math.random() < 0.5 ? 'rgba(110,80,45,.45)' : 'rgba(240,215,160,.45)';
    x.beginPath();
    x.ellipse(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 3, 1 + Math.random() * 2, 0, 0, 6.3);
    x.fill();
  }
  x.fillStyle = '#7a5a34';
  x.fillRect(0, 0, 10, 256);
  x.fillRect(246, 0, 10, 256);
  x.fillStyle = '#e0c28a';
  x.fillRect(10, 0, 3, 256);
  x.fillRect(243, 0, 3, 256);
});
const pBump = mkTex('#808080', [1, 57], (x) => {
  for (let i = 0; i < 900; i++) {
    const v = (60 + Math.random() * 140) | 0;
    x.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')';
    x.beginPath();
    x.ellipse(
      Math.random() * 256,
      Math.random() * 256,
      1 + Math.random() * 4,
      1 + Math.random() * 3,
      Math.random() * 3,
      0,
      6.3,
    );
    x.fill();
  }
  x.fillStyle = 'rgba(40,40,40,.55)';
  x.fillRect(48, 0, 26, 256);
  x.fillRect(182, 0, 26, 256);
  x.fillStyle = '#c8c8c8';
  x.fillRect(0, 0, 12, 256);
  x.fillRect(244, 0, 12, 256);
  x.strokeStyle = 'rgba(30,30,30,.6)';
  x.lineWidth = 1;
  for (let i = 0; i < 60; i++) {
    const a = Math.random() * 256,
      b = Math.random() * 256;
    x.beginPath();
    x.moveTo(a, b);
    x.lineTo(a + Math.random() * 30 - 15, b + Math.random() * 30 - 15);
    x.stroke();
  }
});
const gBump = mkTex('#808080', [30, 40], (x) => {
  for (let i = 0; i < 1400; i++) {
    const v = (70 + Math.random() * 130) | 0;
    x.strokeStyle = 'rgb(' + v + ',' + v + ',' + v + ')';
    x.lineWidth = 1 + Math.random();
    const a = Math.random() * 256,
      b = Math.random() * 256;
    x.beginPath();
    x.moveTo(a, b);
    x.lineTo(a + Math.random() * 4 - 2, b - 4 - Math.random() * 7);
    x.stroke();
  }
});
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(300, 400, 2, 100),
  new THREE.MeshStandardMaterial({ map: gTex, bumpMap: gBump, bumpScale: 2, roughness: 1, metalness: 0 }),
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -6;
scene.add(ground);
const path = new THREE.Mesh(
  new THREE.PlaneGeometry(14, 400, 1, 100),
  new THREE.MeshStandardMaterial({
    map: pTex,
    bumpMap: pBump,
    bumpScale: 3,
    roughness: 1,
    metalness: 0,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  }),
);
path.rotation.x = -Math.PI / 2;
path.position.y = -5.98;
path.receiveShadow = true;
ground.receiveShadow = true;
scene.add(path);
let curv = 0,
  curvApplied = 0,
  RS = 0;
const KAP = 0.0025,
  BN = 140,
  BDS = 2,
  bTab = new Float32Array(BN + 1);
function kap(s) {
  return KAP * Math.sin((s * 6.2832) / 620) * (0.55 + 0.45 * Math.sin((s * 6.2832) / 2100));
}
function buildBend() {
  let psi = 0,
    x = 0,
    s = RS;
  bTab[0] = 0;
  for (let i = 1; i <= BN; i++) {
    psi += kap(s) * BDS;
    x += psi * BDS;
    s += BDS;
    bTab[i] = x;
  }
}
function mkBend(m) {
  const a = m.geometry.attributes.position,
    bx = new Float32Array(a.count),
    wz = new Float32Array(a.count);
  for (let i = 0; i < a.count; i++) {
    bx[i] = a.getX(i);
    wz[i] = -a.getY(i);
  }
  return { a, bx, wz };
}
const bends = [mkBend(ground), mkBend(path)];
function bendOff(z) {
  if (mode !== 5) return 0;
  const d = Math.max(0, -z) / BDS,
    i = Math.min(BN - 1, Math.floor(d)),
    f = Math.min(1, d - i);
  return bTab[i] + (bTab[i + 1] - bTab[i]) * f;
}
function applyCurve() {
  bends.forEach((b) => {
    for (let i = 0; i < b.a.count; i++) b.a.setX(i, b.bx[i] + bendOff(b.wz[i]));
    b.a.needsUpdate = true;
  });
}
