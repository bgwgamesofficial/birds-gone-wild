// Version number, test-build flag and the saved settings object `S`.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

const VERSION = '0.8.3'; // RELEASE.UPDATE.CHANGE - raise the last number with EVERY change (tests/version.js checks it). Shown on the start screen and pause menu.
let cdEnd = 0,
  cdLast = -1,
  fitT = 0; // start countdown (ms timestamp when play begins), menu-fit timer
// The live site (bgwinteractive since 2026-11-08; the old bgwgamesofficial address is kept in case it comes back).
const LIVE_HOSTS = ['bgwinteractive.github.io', 'bgwgamesofficial.github.io'];
const IS_TEST = !(typeof location !== 'undefined' && LIVE_HOSTS.includes(location.hostname)); // everything except the live site
const VER_TXT = 'v' + VERSION + (IS_TEST ? ' \u00b7 test build' : '');
const SKY = 0x9fd8f0;
const DEF = {
  res: '1440p',
  fps: 'auto',
  adaptive: true,
  shadows: 'high',
  bloom: true,
  particles: 'high',
  aniso: 8,
  vignette: true,
  shake: true,
  fov: 65,
  master: 1,
  music: 1,
  sfx: 1,
  musicOn: true,
  sfxOn: true,
  dyn: true,
};
const S = Object.assign({}, DEF);
try {
  Object.assign(S, JSON.parse(localStorage.getItem('flappyset') || '{}'));
} catch (e) {}
function saveS() {
  try {
    localStorage.setItem('flappyset', JSON.stringify(S));
  } catch (e) {}
}
const texList = [];
function SV() {
  return muted || !S.sfxOn ? 0 : S.master * S.sfx;
}
