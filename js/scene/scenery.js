// Roadside scenery (trees, rocks, posts, flowers) that streams past the player.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

// roadside scenery that streams past for a sense of speed
const props = [];
const barkTex = mkTex('#6b4a2b', [1, 2], (x) => {
    for (let i = 0; i < 140; i++) {
      x.fillStyle = Math.random() < 0.5 ? 'rgba(30,18,8,.4)' : 'rgba(160,120,80,.3)';
      x.fillRect(Math.random() * 256, 0, 2 + Math.random() * 4, 60 + Math.random() * 196);
    }
  }),
  trunkM = new THREE.MeshLambertMaterial({ map: barkTex }),
  LC = [0x2f8f3e, 0x3aa24d, 0x24773a, 0x4eb35a, 0x5a9e32, 0xc8832a, 0xb5532a],
  leafM = LC.map((c) => new THREE.MeshLambertMaterial({ color: c })),
  leafL = LC.map((c) => new THREE.MeshLambertMaterial({ color: new THREE.Color(c).offsetHSL(0, 0.02, 0.08) })),
  rockM = new THREE.MeshLambertMaterial({ color: 0x8d9399 }),
  postM = new THREE.MeshLambertMaterial({ color: 0xb08a5a }),
  bushM = new THREE.MeshLambertMaterial({ color: 0x4aa84a });
const gTrunk = new THREE.CylinderGeometry(0.18, 0.34, 2, 10),
  gCone = new THREE.ConeGeometry(1, 1.6, 14),
  gBlob = [0, 1, 2, 3].map((i) => {
    const g = new THREE.SphereGeometry(1, 18, 14),
      p = g.attributes.position;
    for (let k = 0; k < p.count; k++) {
      const x = p.getX(k),
        y = p.getY(k),
        z = p.getZ(k),
        f = 1 + 0.26 * Math.sin(x * 3.1 + i) * Math.cos(z * 2.7 + y * 1.9 + i * 2) + 0.1 * Math.sin(y * 6 + x * 4);
      p.setXYZ(k, x * f, y * f * 0.9, z * f);
    }
    g.computeVertexNormals();
    return g;
  }),
  gRock = new THREE.DodecahedronGeometry(0.8),
  gPost = new THREE.CylinderGeometry(0.12, 0.12, 1.3, 8),
  gBush = new THREE.SphereGeometry(0.7, 12, 8);
const gStem = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 5),
  gHead = new THREE.SphereGeometry(0.14, 8, 6),
  gBlade = new THREE.ConeGeometry(0.06, 0.8, 4),
  stemM = new THREE.MeshLambertMaterial({ color: 0x3a8f3a }),
  headM = [0xff6fae, 0xffd23f, 0xffffff, 0xb06bff].map(
    (c) => new THREE.MeshLambertMaterial({ color: c, emissive: 0x222222 }),
  );
function mkTree(g) {
  const pine = Math.random() < 0.4,
    bi = Math.random() < 0.8 ? Math.floor(Math.random() * 5) : 5 + Math.floor(Math.random() * 2),
    s = 0.9 + Math.random() * 0.9,
    th = pine ? 1.6 : 2.4;
  const t = new THREE.Mesh(gTrunk, trunkM);
  t.scale.set(1, th / 2, 1);
  t.position.y = th / 2;
  g.add(t);
  if (pine) {
    for (let i = 0; i < 5; i++) {
      const c = new THREE.Mesh(gCone, i > 2 ? leafL[2] : leafM[2]),
        r = 1.7 - i * 0.28;
      c.scale.set(r, 1, r);
      c.position.y = 1.5 + i * 0.95;
      c.rotation.y = Math.random() * 3;
      g.add(c);
    }
  } else {
    for (let k = 0; k < 2; k++) {
      const br = new THREE.Mesh(gTrunk, trunkM);
      br.scale.set(0.35, 0.5, 0.35);
      br.position.set(k ? 0.45 : -0.45, th - 0.2, 0);
      br.rotation.z = k ? -0.9 : 0.9;
      g.add(br);
    }
    const n = 6 + Math.floor(Math.random() * 3);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * 6.28 + Math.random(),
        rr = k ? 0.7 + Math.random() * 0.7 : 0,
        hy = th + 0.7 + (k ? Math.random() : 0.6);
      const b = new THREE.Mesh(gBlob[k % 4], (hy > th + 1.3 ? leafL : leafM)[bi]);
      b.position.set(Math.cos(a) * rr, hy, Math.sin(a) * rr);
      b.scale.setScalar(0.9 + Math.random() * 0.7);
      g.add(b);
    }
  }
  g.scale.setScalar(s);
}
function mkProp() {
  const g = new THREE.Group(),
    r = Math.random();
  if (r < 0.45) {
    mkTree(g);
  } else if (r < 0.7) {
    for (let k = 0; k < 3; k++) {
      const b = new THREE.Mesh(gBlob[k], leafM[Math.floor(Math.random() * 3)]);
      b.scale.set(0.5 + Math.random() * 0.3, 0.4 + Math.random() * 0.2, 0.5 + Math.random() * 0.3);
      b.position.set((k - 1) * 0.55, 0.3, Math.random() * 0.4 - 0.2);
      g.add(b);
    }
  } else if (r < 0.8) {
    const k = new THREE.Mesh(gRock, rockM);
    k.scale.set(1 + Math.random(), 0.7, 1 + Math.random() * 0.6);
    k.position.y = 0.3;
    g.add(k);
  } else if (r < 0.88) {
    for (let i = 0; i < 6; i++) {
      const st = new THREE.Mesh(gStem, stemM),
        px = (Math.random() - 0.5) * 1.6,
        pz = (Math.random() - 0.5) * 1.6;
      st.position.set(px, 0.3, pz);
      g.add(st);
      const hd = new THREE.Mesh(gHead, headM[Math.floor(Math.random() * 4)]);
      hd.position.set(px, 0.65, pz);
      g.add(hd);
    }
  } else if (r < 0.94) {
    for (let i = 0; i < 7; i++) {
      const b = new THREE.Mesh(gBlade, stemM);
      b.position.set((Math.random() - 0.5) * 0.8, 0.4, (Math.random() - 0.5) * 0.8);
      b.rotation.set((Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.5);
      b.scale.y = 0.8 + Math.random() * 0.8;
      g.add(b);
    }
  } else {
    for (let i = 0; i < 3; i++) {
      const p = new THREE.Mesh(gPost, postM);
      p.position.set(0, 0.65, i * 1.6);
      g.add(p);
    }
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 3.4), postM);
    rail.position.set(0, 1, 1.6);
    g.add(rail);
  }
  return g;
}
for (let i = 0; i < 95; i++) {
  const g = mkProp();
  g.position.set((Math.random() < 0.5 ? -1 : 1) * (9 + Math.random() * 34), -6, 10 - Math.random() * 260);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  scene.add(g);
  props.push(g);
}
