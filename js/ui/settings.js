// Settings menu: graphics, frame rate, resolution, sound and bloom.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

// ===== settings =====
const setEl = document.getElementById('set'),
  vigEl = document.getElementById('vig');
let composer = null,
  bloomPass = null,
  setTab = 'gfx';
function initComposer() {
  if (!(THREE.EffectComposer && THREE.RenderPass && THREE.UnrealBloomPass && THREE.CopyShader)) return;
  try {
    let rt;
    try {
      if (THREE.WebGLMultisampleRenderTarget && renderer.capabilities.isWebGL2)
        rt = new THREE.WebGLMultisampleRenderTarget(innerWidth, innerHeight, { format: THREE.RGBAFormat });
    } catch (e) {
      rt = undefined;
    }
    composer = new THREE.EffectComposer(renderer, rt);
    composer.addPass(new THREE.RenderPass(scene, cam));
    bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.5, 0.65, 0.93);
    composer.addPass(bloomPass);
  } catch (e) {
    composer = null;
  }
}
function capFps() {
  if (S.fps === 'auto') return Math.min(120, hz);
  if (S.fps === '0') return 999;
  return +S.fps || 60;
}
function applyRes() {
  const th = { '720p': 720, '1080p': 1080, '1440p': 1440, '2160p': 2160 }[S.res];
  let pxv = S.res === 'auto' ? Math.min(devicePixelRatio, 2) : Math.min(4, th / Math.max(300, innerHeight));
  pxv = Math.max(0.5, pxv * adaptK);
  renderer.setPixelRatio(pxv);
  renderer.setSize(innerWidth, innerHeight);
  if (composer) {
    try {
      composer.setPixelRatio(pxv);
      composer.setSize(innerWidth, innerHeight);
    } catch (e) {}
  }
}
function applyShadows() {
  const on = S.shadows !== 'off',
    sz = { low: 1024, high: 2048, ultra: 4096 }[S.shadows] || 2048;
  sun.castShadow = on;
  if (sun.shadow.map) {
    sun.shadow.map.dispose();
    sun.shadow.map = null;
  }
  sun.shadow.mapSize.set(sz, sz);
  if (renderer.shadowMap.enabled !== on) {
    renderer.shadowMap.enabled = on;
    scene.traverse((o) => {
      if (o.material) {
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
          m.needsUpdate = true;
        });
      }
    });
  }
}
function applyAniso() {
  const mx = renderer.capabilities.getMaxAnisotropy();
  texList.forEach((t) => {
    t.anisotropy = Math.min(S.aniso, mx);
    t.needsUpdate = true;
  });
}
function applyAll() {
  adaptK = 1;
  applyRes();
  applyShadows();
  applyAniso();
  vigEl.style.display = S.vignette ? '' : 'none';
}
function applyOne(k) {
  if (k === 'res') {
    adaptK = 1;
    applyRes();
  } else if (k === 'fps') {
    nextFrame = 0;
  } else if (k === 'adaptive') {
    if (!S.adaptive) {
      adaptK = 1;
      applyRes();
    }
  } else if (k === 'shadows') applyShadows();
  else if (k === 'aniso') applyAniso();
  else if (k === 'vignette') vigEl.style.display = S.vignette ? '' : 'none';
}
const PRESETS = {
  low: { res: '720p', shadows: 'off', bloom: false, particles: 'low', aniso: 2 },
  medium: { res: '1080p', shadows: 'low', bloom: false, particles: 'high', aniso: 4 },
  high: { res: '1440p', shadows: 'high', bloom: true, particles: 'high', aniso: 8 },
  ultra: { res: '2160p', shadows: 'ultra', bloom: true, particles: 'high', aniso: 16 },
};
function presetMatch() {
  for (const n in PRESETS) {
    const q = PRESETS[n];
    if (Object.keys(q).every((k) => S[k] === q[k])) return n;
  }
  return '';
}
const ROWS = {
  gfx: [
    {
      k: 'preset',
      l: 'Quality preset',
      t: 'preset',
      o: [
        ['low', 'Low'],
        ['medium', 'Medium'],
        ['high', 'High'],
        ['ultra', 'Ultra'],
      ],
    },
    {
      k: 'res',
      l: 'Resolution',
      t: 'str',
      o: [
        ['auto', 'Auto'],
        ['720p', '720p'],
        ['1080p', '1080p'],
        ['1440p', '2K'],
        ['2160p', '4K'],
      ],
    },
    {
      k: 'fps',
      l: 'Frame rate',
      t: 'str',
      o: [
        ['auto', 'Auto'],
        ['30', '30'],
        ['60', '60'],
        ['120', '120'],
        ['0', 'Max'],
      ],
    },
    { k: 'adaptive', l: 'Adaptive resolution', t: 'bool' },
    {
      k: 'shadows',
      l: 'Shadows',
      t: 'str',
      o: [
        ['off', 'Off'],
        ['low', 'Low'],
        ['high', 'High'],
        ['ultra', 'Ultra'],
      ],
    },
    { k: 'bloom', l: 'Bloom and glow', t: 'bool' },
    {
      k: 'particles',
      l: 'Particles',
      t: 'str',
      o: [
        ['off', 'Off'],
        ['low', 'Low'],
        ['high', 'High'],
      ],
    },
    {
      k: 'aniso',
      l: 'Texture sharpness',
      t: 'num',
      o: [
        ['2', '2x'],
        ['4', '4x'],
        ['8', '8x'],
        ['16', '16x'],
      ],
    },
    { k: 'vignette', l: 'Vignette', t: 'bool' },
    { k: 'shake', l: 'Screen shake', t: 'bool' },
    { k: 'fov', l: 'Field of view', t: 'range', min: 55, max: 85, sc: 1, u: '\u00B0' },
  ],
  snd: [
    { k: 'master', l: 'Master volume', t: 'range', min: 0, max: 100, sc: 100, u: '%' },
    { k: 'music', l: 'Music volume', t: 'range', min: 0, max: 100, sc: 100, u: '%' },
    { k: 'sfx', l: 'Effects volume', t: 'range', min: 0, max: 100, sc: 100, u: '%' },
    { k: 'musicOn', l: 'Music', t: 'bool' },
    { k: 'sfxOn', l: 'Sound effects', t: 'bool' },
    { k: 'dyn', l: 'Dynamic music', t: 'bool' },
  ],
};
function segHTML(r) {
  const cur = r.k === 'preset' ? presetMatch() : String(S[r.k]);
  const o =
    r.t === 'bool'
      ? [
          ['true', 'On'],
          ['false', 'Off'],
        ]
      : r.o;
  return (
    '<div class="seg">' +
    o
      .map(
        (a) =>
          '<button data-k="' +
          r.k +
          '" data-v="' +
          a[0] +
          '"' +
          (cur === a[0] ? ' class="on"' : '') +
          '>' +
          a[1] +
          '</button>',
      )
      .join('') +
    '</div>'
  );
}
function renderSettings() {
  const old = setEl.querySelector('.panel'),
    st = old ? old.scrollTop : 0;
  let h =
    '<div class="panel"><h2>Settings</h2><div class="tabs"><button data-tab="gfx"' +
    (setTab === 'gfx' ? ' class="on"' : '') +
    '>Graphics</button><button data-tab="snd"' +
    (setTab === 'snd' ? ' class="on"' : '') +
    '>Sound</button></div><div class="rows">';
  ROWS[setTab].forEach((r) => {
    let lab = r.l;
    if (r.k === 'fps') lab += ' <small>(display ' + hz + ' Hz)</small>';
    if (r.k === 'bloom' && !composer) lab += ' <small>(unavailable here)</small>';
    if (r.t === 'range') {
      const v = Math.round(S[r.k] * r.sc);
      h +=
        '<div class="row"><label>' +
        lab +
        ' <span class="val">' +
        v +
        r.u +
        '</span></label><input type="range" data-k="' +
        r.k +
        '" min="' +
        r.min +
        '" max="' +
        r.max +
        '" value="' +
        v +
        '"></div>';
    } else h += '<div class="row"><label>' + lab + '</label>' + segHTML(r) + '</div>';
  });
  h += '</div><div class="sfoot"><button id="resetbest">Reset best score</button>';
  if (setTab === 'snd') h += '<button id="settest">Test sound</button>';
  h += '<button id="setclose">Done</button></div></div>';
  setEl.innerHTML = h;
  const np = setEl.querySelector('.panel');
  if (np) np.scrollTop = st;
  fitMenus();
}
function openSettings() {
  if (setOpen) return;
  setOpen = true;
  if (state === 'play') paused = true;
  pauseEl.classList.remove('on');
  renderSettings();
  setEl.classList.add('on');
}
function closeSettings() {
  setOpen = false;
  setEl.classList.remove('on');
  saveS();
  if (state === 'play' && paused && !lvlOpen && !shopOpen && !hold) pauseEl.classList.add('on');
}
setEl.addEventListener('pointerdown', (e) => e.stopPropagation());
setEl.addEventListener('click', (e) => {
  if (e.target === setEl) {
    closeSettings();
    return;
  }
  const b = e.target.closest('button');
  if (!b) return;
  if (b.id === 'setclose') {
    closeSettings();
    return;
  }
  if (b.id === 'settest') {
    sfx.coin();
    return;
  }
  if (b.id === 'resetbest') {
    if (b.dataset.sure) {
      resetBest();
      delete b.dataset.sure;
      b.classList.remove('sure');
      b.textContent = 'Best score reset \u2713';
      sfx.buy();
    } else {
      b.dataset.sure = '1';
      b.classList.add('sure');
      b.textContent = 'Tap again to reset';
      setTimeout(() => {
        if (b.dataset.sure) {
          delete b.dataset.sure;
          b.classList.remove('sure');
          b.textContent = 'Reset best score';
        }
      }, 3000);
    }
    return;
  }
  if (b.dataset.tab) {
    setTab = b.dataset.tab;
    renderSettings();
    return;
  }
  if (b.dataset.k) {
    const k = b.dataset.k,
      v = b.dataset.v;
    if (k === 'preset') {
      Object.assign(S, PRESETS[v]);
      applyAll();
    } else {
      const row = ROWS.gfx.concat(ROWS.snd).find((r) => r.k === k);
      S[k] = row.t === 'bool' ? v === 'true' : row.t === 'num' ? +v : v;
      applyOne(k);
    }
    saveS();
    renderSettings();
  }
});
setEl.addEventListener('input', (e) => {
  const el = e.target;
  if (el.type !== 'range') return;
  const k = el.dataset.k,
    row = ROWS.gfx.concat(ROWS.snd).find((r) => r.k === k);
  S[k] = +el.value / row.sc;
  const v = el.parentNode.querySelector('.val');
  if (v) v.textContent = Math.round(S[k] * row.sc) + row.u;
  saveS();
});
