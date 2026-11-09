// Shared helper that paints canvas textures (grass, road, bark).
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

function mkTex(base, rep, draw) {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const x = c.getContext('2d');
  x.scale(2, 2);
  x.fillStyle = base;
  x.fillRect(0, 0, 256, 256);
  draw(x);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rep[0], rep[1]);
  t.anisotropy = S.aniso;
  texList.push(t);
  return t;
}
