// The toucan model, its colour choices and its ground shadow.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

const rimMat = new THREE.ShaderMaterial({
  uniforms: { c: { value: new THREE.Color(0xbfe9ff) }, k: { value: 1 } },
  vertexShader:
    'varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
  fragmentShader:
    'uniform vec3 c;uniform float k;varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.-max(dot(normalize(vN),normalize(vV)),0.),2.5);gl_FragColor=vec4(c,f*k);}',
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
function rim(m) {
  const o = new THREE.Mesh(m.geometry, rimMat);
  o.scale.setScalar(1.02);
  m.add(o);
}
const bird = new THREE.Group(),
  wings = [],
  bm = {};
{
  const M = (c) => new THREE.MeshPhongMaterial({ color: c, shininess: 55, specular: 0x444444 });
  const wh = M(0xffffff),
    dk = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 18), (bm.body = M(0x24242c)));
  body.scale.set(1, 0.95, 1.3);
  bird.add(body);
  rim(body);
  const bib = new THREE.Mesh(new THREE.SphereGeometry(0.45, 20, 14), (bm.belly = M(0xfff0c0)));
  bib.position.set(0, -0.05, -0.38);
  bib.scale.set(1, 0.95, 0.9);
  bird.add(bib);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 14), bm.body);
  head.position.set(0, 0.32, -0.62);
  bird.add(head);
  rim(head);
  const bk = [M(0xffc21e), M(0xff8a1a), M(0x2b2b2b)];
  [
    [0.24, 0.2, 0.4, -1.1, 0.3, 0],
    [0.2, 0.14, 0.35, -1.475, 0.26, 1],
    [0.14, 0.05, 0.25, -1.775, 0.2, 2],
  ].forEach((a) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(a[0], a[1], a[2], 16), bk[a[5]]);
    m.rotation.x = Math.PI / 2;
    m.scale.set(1, 1, 0.85);
    m.position.set(0, a[4], a[3]);
    bird.add(m);
  });
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.025, 0.5), M(0xd8302a));
  stripe.position.set(0, 0.22, -1.3);
  bird.add(stripe);
  [-1, 1].forEach((sx) => {
    const ring = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), M(0x4cc3ff));
    ring.position.set(sx * 0.34, 0.42, -0.82);
    bird.add(ring);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), wh);
    eye.position.set(sx * 0.38, 0.44, -0.9);
    bird.add(eye);
    const pu = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), dk);
    pu.position.set(sx * 0.41, 0.44, -0.97);
    bird.add(pu);
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.55, 0.12, -0.05);
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 10), bm.wing || (bm.wing = M(0x2e2e38)));
    w.scale.set(1, 0.14, 0.62);
    w.position.x = sx * 0.5;
    pivot.add(w);
    rim(w);
    bird.add(pivot);
    wings.push(pivot);
  });
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.0, 12), (bm.tail = M(0x1a1a20)));
  tail.rotation.x = Math.PI / 2;
  tail.position.set(0, 0.1, 1.15);
  tail.scale.set(1.4, 1, 0.35);
  bird.add(tail);
  rim(tail);
  const ut = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), M(0xe5343a));
  ut.position.set(0, -0.12, 0.85);
  ut.scale.set(1, 0.5, 0.9);
  bird.add(ut);
  bird.traverse((o) => {
    if (o.isMesh && o.material !== rimMat) o.castShadow = true;
  });
  scene.add(bird);
}
const COLORS = {
  black: [0x24242c, 0xfff0c0, 0x1a1a20, 0x2e2e38],
  red: [0xe5483b, 0xffd9d2, 0xb8271c, 0xc9342a],
  blue: [0x3b8bff, 0xd6ecff, 0x2763d6, 0x2a6fe0],
  green: [0x3cbf5a, 0xdcf7e0, 0x238a3c, 0x2ea84a],
  yellow: [0xffd23f, 0xfff3b0, 0xe0a800, 0xf2b01e],
  orange: [0xff8f2b, 0xffe0c2, 0xd9650a, 0xf27a12],
  pink: [0xff6fae, 0xffdcec, 0xd9467f, 0xf0558f],
};
let birdCol = 'black';
try {
  const sc = localStorage.getItem('flappycolor');
  if (sc && COLORS[sc]) birdCol = sc;
} catch (e) {}
function setBirdColor(n) {
  const c = COLORS[n];
  if (!c) return;
  bm.body.color.setHex(c[0]);
  bm.belly.color.setHex(c[1]);
  bm.tail.color.setHex(c[2]);
  bm.wing.color.setHex(c[3]);
  rimMat.uniforms.c.value.setHex(c[1]);
}
setBirdColor(birdCol);
const shadow = new THREE.Mesh(
  new THREE.CircleGeometry(0.9, 24),
  new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false }),
);
shadow.rotation.x = -Math.PI / 2;
shadow.position.set(0, -5.94, 0);
scene.add(shadow);
