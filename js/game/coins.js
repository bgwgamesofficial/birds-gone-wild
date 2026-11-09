// Materials and models for pipes and coins.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

const pipeTex = mkTex('#aaaaaa', [1, 1], (x) => {
  const g = x.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0, '#4a4a4a');
  g.addColorStop(0.2, '#d8d8d8');
  g.addColorStop(0.3, '#ffffff');
  g.addColorStop(0.58, '#a6a6a6');
  g.addColorStop(0.88, '#5c5c5c');
  g.addColorStop(1, '#4a4a4a');
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 256);
});
const PAL = [0.0, 0.07, 0.12, 0.5, 0.6, 0.75, 0.9];
const mats = PAL.map((h) => ({
  p: new THREE.MeshPhongMaterial({
    color: new THREE.Color().setHSL(h, 0.7, 0.52),
    map: pipeTex,
    shininess: 70,
    specular: 0x555555,
  }),
  c: new THREE.MeshPhongMaterial({
    color: new THREE.Color().setHSL(h, 0.75, 0.38),
    map: pipeTex,
    shininess: 70,
    specular: 0x555555,
  }),
}));
const gTube = new THREE.CylinderGeometry(R, R, 30, 36),
  gRim = new THREE.CylinderGeometry(R + 0.4, R + 0.4, 0.8, 36);
const coinGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.16, 36);
coinGeo.rotateX(Math.PI / 2);
const coinMat = new THREE.MeshLambertMaterial({ color: 0xffc928, emissive: 0xc88a00, emissiveIntensity: 0.35 });
const coinTex = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(100, 90, 10, 128, 128, 128);
  g.addColorStop(0, '#fff3a8');
  g.addColorStop(0.6, '#ffc928');
  g.addColorStop(1, '#d89a10');
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 256);
  x.strokeStyle = '#a86d00';
  x.lineWidth = 10;
  x.beginPath();
  x.arc(128, 128, 100, 0, 6.3);
  x.stroke();
  x.strokeStyle = 'rgba(255,245,170,.9)';
  x.lineWidth = 3;
  x.beginPath();
  x.arc(128, 128, 108, 0, 6.3);
  x.stroke();
  x.setLineDash([6, 8]);
  x.strokeStyle = 'rgba(150,95,0,.7)';
  x.lineWidth = 3;
  x.beginPath();
  x.arc(128, 128, 88, 0, 6.3);
  x.stroke();
  x.setLineDash([]);
  x.font = '900 150px Trebuchet MS,Arial,sans-serif';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillStyle = 'rgba(120,70,0,.9)';
  x.fillText('$', 132, 140);
  x.fillStyle = '#fff0a0';
  x.fillText('$', 126, 132);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = S.aniso;
  texList.push(t);
  return t;
})();
const faceMat = new THREE.MeshLambertMaterial({ map: coinTex, emissive: 0x7a5200, emissiveIntensity: 0.2 });
const reedTex = mkTex('#b57a08', [28, 1], (x) => {
  x.fillStyle = '#ffd45a';
  x.fillRect(0, 0, 128, 256);
});
const sideMat = new THREE.MeshLambertMaterial({ map: reedTex, emissive: 0x6b4a00, emissiveIntensity: 0.35 });
const gCoinSide = new THREE.CylinderGeometry(0.76, 0.76, 0.2, 48, 1, true).rotateX(Math.PI / 2),
  gCoinRim = new THREE.TorusGeometry(0.7, 0.06, 10, 48),
  gCoinFace = new THREE.CircleGeometry(0.68, 48);
function mkCoin() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(gCoinSide, sideMat));
  [1, -1].forEach((d) => {
    const r = new THREE.Mesh(gCoinRim, coinMat);
    r.position.z = 0.09 * d;
    g.add(r);
    const f = new THREE.Mesh(gCoinFace, faceMat);
    f.position.z = 0.1 * d;
    if (d < 0) f.rotation.y = Math.PI;
    g.add(f);
  });
  return g;
}
const gHole = new THREE.CircleGeometry(R + 0.12, 40),
  holeMat = new THREE.MeshBasicMaterial({ color: 0x040404 });
const glowMat = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 2, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,225,120,1)');
  g.addColorStop(0.35, 'rgba(255,190,60,.45)');
  g.addColorStop(1, 'rgba(255,170,40,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  return new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(c),
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    fog: false,
    opacity: 0,
  });
})();
