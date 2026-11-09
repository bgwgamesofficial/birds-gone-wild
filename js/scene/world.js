// Grass stripes, clouds, cloud banks, flight-height limits and the entity lists (pipes, foes).
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

const stripes = [];
for (let i = 0; i < 20; i++) {
  const s = new THREE.Mesh(new THREE.PlaneGeometry(200, 5), new THREE.MeshLambertMaterial({ color: 0x6bb540 }));
  s.rotation.x = -Math.PI / 2;
  s.position.set(0, -5.99, 0);
}

// clouds
const clouds = [];
const cm = new THREE.MeshLambertMaterial({ color: 0xffffff });
const cloudMat = new THREE.SpriteMaterial({
  map: (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const x = c.getContext('2d');
    for (let i = 0; i < 7; i++) {
      const px = 40 + Math.random() * 48,
        py = 50 + Math.random() * 30,
        r = 22 + Math.random() * 16;
      const g = x.createRadialGradient(px, py, 2, px, py, r);
      g.addColorStop(0, 'rgba(255,255,255,.55)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g;
      x.fillRect(0, 0, 128, 128);
    }
    return new THREE.CanvasTexture(c);
  })(),
  transparent: true,
  depthWrite: false,
  fog: false,
  opacity: 0.95,
});
const hm = new THREE.MeshLambertMaterial({ color: 0x8fd16a });
function puff() {
  const g = new THREE.Group();
  const n = 4 + Math.floor(Math.random() * 3);
  for (let k = 0; k < n; k++) {
    const s = new THREE.Sprite(cloudMat);
    const sz = 5 + Math.random() * 4;
    s.scale.set(sz * 1.5, sz, 1);
    s.position.set((k - n / 2) * 3.2, Math.random() * 1.2, (Math.random() - 0.5) * 2);
    g.add(s);
  }
  return g;
}
for (let i = 0; i < 14; i++) {
  const c = puff();
  c.position.set((Math.random() - 0.5) * 80, 12 + Math.random() * 10, -Math.random() * 90);
  scene.add(c);
  clouds.push(c);
}

// pipes
const PIPE_W = 3,
  R = 1.5,
  SPACING = 18,
  TOP = 11,
  BOT = -6;
let CEIL = 16,
  CLO = 9.5,
  GAP = 7; // CEIL = flight ceiling, CLO = cloud base (both set per mode in applyMode)
// cloud banks: soft sprites in the upper flight band that hide things when you climb
const banks = [],
  bankTint = new THREE.Color(1, 1, 1),
  cloudFx = document.getElementById('cloudfx');
function bankReset(b, far) {
  const sz = 14 + Math.random() * 14,
    thin = CLO > 10;
  b.scale.set(sz * 1.5, thin ? sz * 0.35 : sz, 1);
  b.position.set(
    (Math.random() - 0.5) * 34,
    thin ? CLO + 1.5 + Math.random() * (CEIL + 1 - CLO - 1.5) : CLO + Math.random() * (CEIL + 3 - CLO),
    far ? -10 - Math.random() * 70 : 6 - Math.random() * 70,
  );
  b.userData.o = 0.35 + Math.random() * 0.5;
  b.userData.sz = sz;
}
for (let i = 0; i < 34; i++) {
  const b = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: cloudMat.map, transparent: true, depthWrite: false, opacity: 0 }),
  );
  bankReset(b, false);
  scene.add(b);
  banks.push(b);
}
const skyT = new THREE.Color();
let lastBase = 2.5,
  hawkT = 2.2,
  lastDir = 0,
  dirRun = 0;
const pipeMat = new THREE.MeshLambertMaterial({ color: 0x3fae3f });
const capMat = new THREE.MeshLambertMaterial({ color: 0x2f8f2f });
const pipes = [],
  foes = [],
  FVX = 7.5;
