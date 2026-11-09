// Three curved mountain layers around the horizon and their shader colours.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

// Mountains: three curved layers around the horizon (far snowy peaks, mid range, near hills).
// Shader colours: slope shading, snow caps, haze at the base, moonlit rim at night, glowing outline in Neon.
function mtnH(a, seed) {
  const e = 0.4 + 0.6 * Math.pow(0.5 + 0.5 * Math.sin(a * 1.9 + seed), 1.4);
  let r = 0;
  [
    [2.7, 0.5],
    [6.1, 0.28],
    [13.3, 0.14],
    [29, 0.08],
  ].forEach((fw, k) => {
    const q = 1 - Math.abs(Math.sin(a * fw[0] + seed * (k + 1) * 1.7));
    r += q * q * fw[1];
  });
  return 0.1 + 0.9 * e * r;
}
const MTN_VS =
  'attribute float hr;attribute float sh;uniform float amp;varying float vH;varying float vHR;varying float vSh;varying float vX;void main(){vH=(position.y+6.)/amp;vHR=hr;vSh=sh;vX=position.x;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
const MTN_FS =
  'uniform vec3 body;uniform vec3 haze;uniform vec3 snow;uniform vec3 rim;uniform vec3 edge;uniform float snowK;uniform float snowL;uniform float rimK;uniform float edgeK;uniform float farK;varying float vH;varying float vHR;varying float vSh;varying float vX;' +
  'void main(){vec3 c=body*(.8+.4*vSh);float sn=smoothstep(snowL,snowL+.05,vH+.035*sin(vX*.11)+.02*sin(vX*.37))*snowK;c=mix(c,snow*(.86+.22*vSh),sn);' +
  'float top=smoothstep(vHR-.04,vHR,vH);c+=rim*top*rimK;float hz=1.-smoothstep(-.06,.55,vH);c=mix(c,haze,clamp(hz*.92+farK,0.,1.));' +
  'c+=edge*(smoothstep(vHR-.014,vHR,vH)+.25*smoothstep(vHR-.06,vHR,vH))*edgeK;gl_FragColor=vec4(c,1.);}';
function mkMountains(R, amp, seed, o) {
  const N = 240,
    pos = new Float32Array((N + 1) * 2 * 3),
    hr = new Float32Array((N + 1) * 2),
    sh = new Float32Array((N + 1) * 2),
    idx = [];
  for (let i = 0; i <= N; i++) {
    const a = -1.6 + (3.2 * i) / N,
      h = mtnH(a, seed),
      d = 0.03;
    let sl = 0;
    for (let q = -2; q <= 2; q++) {
      const b = a + q * 0.008;
      sl += (mtnH(b - d, seed) - mtnH(b + d, seed)) / (2 * d) / 5;
    }
    (x = Math.sin(a) * R), (z = -Math.cos(a) * R);
    pos.set([x, -14, z, x, -6 + h * amp, z], i * 6);
    hr[i * 2] = hr[i * 2 + 1] = h;
    sh[i * 2] = sh[i * 2 + 1] = Math.max(-1, Math.min(1, sl * 0.3));
    if (i < N) {
      const b = i * 2;
      idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('hr', new THREE.BufferAttribute(hr, 1));
  g.setAttribute('sh', new THREE.BufferAttribute(sh, 1));
  g.setIndex(idx);
  const u = {
    amp: { value: amp },
    body: { value: new THREE.Color() },
    haze: { value: new THREE.Color() },
    snow: { value: new THREE.Color() },
    rim: { value: new THREE.Color(0.55, 0.65, 0.95) },
    edge: { value: new THREE.Color() },
    snowK: { value: 0 },
    snowL: { value: o.snowL },
    rimK: { value: 0 },
    edgeK: { value: 0 },
    farK: { value: o.farK },
  };
  const m = new THREE.Mesh(
    g,
    new THREE.ShaderMaterial({ uniforms: u, vertexShader: MTN_VS, fragmentShader: MTN_FS, side: THREE.DoubleSide }),
  );
  m.renderOrder = -7;
  scene.add(m);
  return Object.assign(o, { m, u });
}
const mtns = [
  mkMountains(278, 92, 1.3, {
    snowL: 0.62,
    snowMax: 1,
    farK: 0.3,
    shift: 30,
    day: new THREE.Color(0.52, 0.62, 0.76),
    night: new THREE.Color(0.1, 0.12, 0.24),
    neon: new THREE.Color(0.22, 0.04, 0.34),
    glow: new THREE.Color(1, 0.2, 0.8),
  }),
  mkMountains(232, 58, 4.1, {
    snowL: 0.78,
    snowMax: 0.8,
    farK: 0.16,
    shift: 20,
    day: new THREE.Color(0.42, 0.54, 0.6),
    night: new THREE.Color(0.07, 0.09, 0.17),
    neon: new THREE.Color(0.13, 0.02, 0.23),
    glow: new THREE.Color(0.8, 0.3, 1),
  }),
  mkMountains(186, 28, 7.7, {
    snowL: 9,
    snowMax: 0,
    farK: 0.06,
    shift: 12,
    day: new THREE.Color(0.33, 0.47, 0.38),
    night: new THREE.Color(0.04, 0.06, 0.1),
    neon: new THREE.Color(0.06, 0.01, 0.12),
    glow: new THREE.Color(0.2, 0.95, 1),
  }),
];
const cSnowD = new THREE.Color(0.96, 0.97, 1),
  cSnowN = new THREE.Color(0.45, 0.5, 0.66),
  cDuskT = new THREE.Color(1.12, 0.86, 0.8);
function updMountains(dd, nt0, tw, neo, pulse) {
  mtns.forEach((L) => {
    const u = L.u;
    u.body.value.copy(L.night).lerp(L.day, dd);
    if (tw > 0) u.body.value.lerp(u.body.value.clone().multiply(cDuskT), tw);
    u.body.value.lerp(L.neon, neo);
    u.haze.value.copy(skyU.bot.value);
    u.snow.value.copy(cSnowN).lerp(cSnowD, dd);
    u.snowK.value = L.snowMax * (1 - neo);
    u.rimK.value = nt0 * (1 - neo) * 0.5;
    u.edge.value.copy(L.glow);
    u.edgeK.value = neo * (1.1 + 0.5 * pulse);
    L.m.position.x = -curv * L.shift;
  });
}
const cTopD = new THREE.Color(0x3f8fe0),
  cTopN = new THREE.Color(0x050a1c),
  cTopU = new THREE.Color(0x4a5aa8),
  cBotD = new THREE.Color(0xbfe6f7),
  cBotN = new THREE.Color(0x16224a),
  cBotU = new THREE.Color(0xf6a56a);
