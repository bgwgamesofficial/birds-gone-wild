// Day/night sky: sky dome, sun, moon, stars and shooting stars.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

// sky objects for the day/night cycle
let tod0 = Math.random();
const cNight = new THREE.Color(0x0a1230),
  cDay = new THREE.Color(0x9fd8f0),
  cDusk = new THREE.Color(0xf29a62);
const sunM = new THREE.Mesh(
  new THREE.SphereGeometry(7, 20, 14),
  new THREE.MeshBasicMaterial({ color: 0xfff1b0, fog: false }),
);
const moonM = new THREE.Mesh(
  new THREE.SphereGeometry(5, 20, 14),
  new THREE.MeshBasicMaterial({ color: 0xe8efff, fog: false }),
);
// Night sky (calm): soft round stars with a gentle twinkle, bright cratered moon, rare shooting stars.
// Sun, moon, stars and shooting stars sit far away (z about -285) so they are behind the mountains.
const SKYZ = -285,
  SKYK = 2.35;
const starU = { op: { value: 0 }, t: { value: 0 }, pr: { value: 1 } };
const stars = (() => {
  const n = 1100,
    p = new Float32Array(n * 3),
    a = new Float32Array(n * 3),
    c = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    p[i * 3] = (Math.random() * 2 - 1) * 330;
    p[i * 3 + 1] = 8 + Math.pow(Math.random(), 0.75) * 250;
    p[i * 3 + 2] = SKYZ - 6;
    const big = Math.random() < 0.06;
    a[i * 3] = big ? 3.2 + Math.random() * 1.6 : 1.3 + Math.random() * 1.5;
    a[i * 3 + 1] = Math.random() * 6.28;
    a[i * 3 + 2] = Math.random() < 0.18 ? 1.5 + Math.random() * 2 : 0.4 + Math.random() * 0.6;
    const k = Math.random(),
      col = k < 0.1 ? [0.8, 0.88, 1] : k < 0.16 ? [1, 0.92, 0.8] : [1, 1, 1];
    c.set(col, i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  g.setAttribute('sp', new THREE.BufferAttribute(a, 3));
  g.setAttribute('col', new THREE.BufferAttribute(c, 3));
  return new THREE.Points(
    g,
    new THREE.ShaderMaterial({
      uniforms: starU,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader:
        'attribute vec3 sp;attribute vec3 col;uniform float t;uniform float pr;varying float vA;varying vec3 vC;void main(){float tw=.78+.22*sin(t*sp.z+sp.y);vA=tw;vC=col;gl_PointSize=sp.x*pr;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:
        'uniform float op;varying float vA;varying vec3 vC;void main(){float r=length(gl_PointCoord-.5)*2.;float a=(exp(-r*r*5.)+.25*exp(-r*r*1.6))*vA*op;gl_FragColor=vec4(vC*a,a);}',
    }),
  );
})();
function moonTex() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#f3f5fa';
  x.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 8; i++) {
    const px = Math.random() * 512,
      py = 60 + Math.random() * 140,
      r = 25 + Math.random() * 45,
      g = x.createRadialGradient(px, py, 2, px, py, r);
    g.addColorStop(0, 'rgba(150,160,180,.4)');
    g.addColorStop(1, 'rgba(150,160,180,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 512, 256);
  }
  for (let i = 0; i < 90; i++) {
    const px = Math.random() * 512,
      py = 20 + Math.random() * 216,
      r = Math.random() < 0.12 ? 6 + Math.random() * 9 : 1.5 + Math.random() * 4;
    x.beginPath();
    x.arc(px, py, r, 0, 6.283);
    x.fillStyle = 'rgba(140,148,166,.35)';
    x.fill();
    x.beginPath();
    x.arc(px + r * 0.25, py + r * 0.25, r * 0.72, 0, 6.283);
    x.fillStyle = 'rgba(250,251,255,.4)';
    x.fill();
  }
  return new THREE.CanvasTexture(c);
}
moonM.material.map = moonTex();
moonM.material.color.setRGB(1.15, 1.15, 1.2);
moonM.rotation.y = -1.2;
moonM.scale.setScalar(1.25 * SKYK);
sunM.scale.setScalar(SKYK);
const moonHalo = glowSprite(0xdfe8ff, 7);
moonM.add(moonHalo);
const shoot = (() => {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 16;
  const x = c.getContext('2d'),
    g = x.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.85, 'rgba(220,235,255,.7)');
  g.addColorStop(1, 'rgba(255,255,255,1)');
  x.fillStyle = g;
  x.fillRect(0, 6, 256, 4);
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(55, 1.4),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(c),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    }),
  );
  m.position.z = SKYZ - 4;
  m.userData = { t: -1, next: 10, vx: 0, vy: 0 };
  return m;
})();
scene.add(shoot);
function updNightSky(nt, dt, now) {
  starU.op.value = Math.max(0, nt * 1.25 - 0.2);
  starU.t.value = now / 1000;
  starU.pr.value = renderer.getPixelRatio();
  moonHalo.material.opacity = 0.8 * nt;
  const u = shoot.userData;
  if (u.t < 0) {
    u.next -= dt;
    if (u.next <= 0 && nt > 0.8) {
      u.t = 0;
      const dir = Math.random() < 0.5 ? -1 : 1;
      shoot.position.set(-dir * (40 + Math.random() * 120), 130 + Math.random() * 90, SKYZ - 4);
      u.vx = dir * (150 + Math.random() * 80);
      u.vy = -(50 + Math.random() * 40);
      shoot.rotation.z = Math.atan2(u.vy, u.vx);
    }
    shoot.material.opacity = 0;
  } else {
    u.t += dt;
    shoot.position.x += u.vx * dt;
    shoot.position.y += u.vy * dt;
    shoot.material.opacity = Math.sin(Math.min(1, u.t / 0.8) * 3.1416) * nt * 0.8;
    if (u.t > 0.8) {
      u.t = -1;
      u.next = 9 + Math.random() * 16;
    }
  }
}
scene.add(sunM, moonM, stars);
function glowSprite(hex, size) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  const col = new THREE.Color(hex),
    r = Math.round(col.r * 255),
    g = Math.round(col.g * 255),
    b = Math.round(col.b * 255);
  const gr = x.createRadialGradient(64, 64, 4, 64, 64, 64);
  gr.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',.9)');
  gr.addColorStop(0.3, 'rgba(' + r + ',' + g + ',' + b + ',.35)');
  gr.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
  x.fillStyle = gr;
  x.fillRect(0, 0, 128, 128);
  const sp2 = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(c),
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      fog: false,
    }),
  );
  sp2.scale.set(size, size, 1);
  return sp2;
}
sunM.add(glowSprite(0xffe9a0, 70));
moonM.add(glowSprite(0xaec6ff, 36));
const skyU = {
  top: { value: new THREE.Color(0x3f8fe0) },
  bot: { value: new THREE.Color(0xbfe6f7) },
  hz: { value: new THREE.Color(1, 0.25, 0.75) },
  hk: { value: 0 },
};
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(300, 24, 16),
  new THREE.ShaderMaterial({
    uniforms: skyU,
    side: THREE.BackSide,
    depthWrite: false,
    vertexShader:
      'varying float h;void main(){h=normalize(position).y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:
      'uniform vec3 top;uniform vec3 bot;uniform vec3 hz;uniform float hk;varying float h;void main(){float k=pow(clamp(h*1.5+.08,0.,1.),.65);vec3 c=mix(bot,top,k)+hz*hk*(exp(-abs(h-.01)*30.)*.55+exp(-abs(h-.01)*90.)*.5);gl_FragColor=vec4(c,1.);}',
  }),
);
sky.renderOrder = -10;
scene.add(sky);
