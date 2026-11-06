// Background music (procedural chiptune + Neon synthwave) and the sound button.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

// background music (procedural chiptune)
let mBus = null,
  mTimer = 0,
  mNext = 0,
  mStep = 0,
  mTgt = -1,
  hatBuf = null,
  mStress = 0,
  mCx = 0,
  mMinor = false;
const ROOT = [48, 45, 41, 43],
  CHT = [
    [0, 4, 7, 12],
    [0, 3, 7, 12],
    [0, 4, 7, 12],
    [0, 4, 7, 12],
  ];
const MEL = [
  72, 0, 76, 0, 79, 76, 72, 0, 69, 0, 72, 0, 76, 72, 69, 0, 72, 0, 77, 0, 81, 77, 72, 0, 71, 74, 79, 74, 71, 0, 67, 0,
];
const ARP = [0, 1, 2, 3, 2, 1, 2, 1];
const ROOT_T = [45, 41, 43, 40],
  CHT_T = [
    [0, 3, 7, 12],
    [0, 4, 7, 12],
    [0, 4, 7, 12],
    [0, 4, 7, 12],
  ],
  MEL_T = [
    81, 0, 76, 0, 72, 76, 81, 0, 77, 0, 72, 0, 69, 72, 77, 0, 79, 0, 74, 0, 71, 74, 79, 0, 80, 0, 76, 0, 71, 76, 80, 83,
  ];
function mkick(t) {
  const o = AC.createOscillator(),
    g = AC.createGain();
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
  g.gain.setValueAtTime(0.55, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  o.connect(g);
  g.connect(mBus);
  o.start(t);
  o.stop(t + 0.2);
}
function mtof(m) {
  return 440 * Math.pow(2, (m - 69) / 12);
}
function mnote(m, t, d, type, v) {
  const o = AC.createOscillator(),
    g = AC.createGain();
  o.type = type;
  o.frequency.value = mtof(m);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g);
  g.connect(mBus);
  o.start(t);
  o.stop(t + d + 0.03);
}
function mhat(t, v) {
  const s = AC.createBufferSource(),
    g = AC.createGain();
  s.buffer = hatBuf;
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  s.connect(g);
  g.connect(mBus);
  s.start(t);
}
// Neon music: upbeat synthwave loop (C - G - Am - F), steady 120 bpm, plays while Neon is on.
const NSPB = 60 / 120 / 2,
  NROOT = [48, 43, 45, 41],
  NCH = [
    [0, 4, 7, 12],
    [0, 4, 7, 12],
    [0, 3, 7, 12],
    [0, 4, 7, 12],
  ],
  NARP = [0, 1, 2, 3, 1, 2, 3, 2],
  NMEL = [
    76, 0, 79, 0, 81, 79, 76, 0, 74, 0, 79, 0, 0, 74, 71, 0, 72, 0, 76, 0, 79, 0, 84, 0, 81, 0, 79, 0, 77, 76, 0, 0,
  ],
  nKick = [];
let mNeonOn = false;
function neonStep(s, t) {
  const sp = NSPB,
    ch = s >> 3,
    r = NROOT[ch],
    C = NCH[ch],
    b = r - 12 + (s % 2 ? 12 : 0);
  mnote(b, t, sp * 0.85, 'triangle', 0.22);
  mnote(b, t, sp * 0.6, 'sawtooth', 0.05);
  mnote(r + 24 + C[NARP[s % 8]], t, sp * 0.45, 'square', 0.028);
  mnote(r + 24 + C[NARP[(s + 3) % 8]], t + sp / 2, sp * 0.4, 'square', 0.02);
  if (NMEL[s]) {
    mnote(NMEL[s], t, sp * 1.7, 'triangle', 0.13);
    mnote(NMEL[s] + 12, t, sp * 1.2, 'sine', 0.03);
  }
  if (s % 8 === 0) [0, 1, 2].forEach((i) => mnote(r + 12 + C[i], t, sp * 7.6, 'sine', 0.045));
  if (s % 2 === 0) {
    mkick(t);
    nKick.push(t);
    if (nKick.length > 8) nKick.shift();
  }
  if (s % 4 === 2) {
    mhat(t, 0.15);
    mnote(50, t, 0.09, 'triangle', 0.07);
  }
  if (s % 2 === 1) mhat(t, 0.06);
  mhat(t + sp / 2, 0.022);
}
function beatPulse(now) {
  if (AC && nKick.length) {
    const ct = AC.currentTime;
    let kt = -1;
    for (let i = nKick.length - 1; i >= 0; i--)
      if (nKick[i] <= ct) {
        kt = nKick[i];
        break;
      }
    if (kt >= 0 && ct - kt < 1) return Math.exp(-(ct - kt) * 7);
  }
  return Math.exp(-((now / 1000) % 0.5) * 7);
}
function musTick() {
  if (!AC || AC.state !== 'running') return;
  const st = S.dyn ? mStress : 0.15,
    cx = S.dyn ? mCx : 0.2,
    spb = 60 / (118 + st * 52) / 2;
  if (mNext < AC.currentTime - 0.3) mNext = AC.currentTime + 0.05;
  while (mNext < AC.currentTime + 0.3) {
    const s = mStep % 32,
      ch = s >> 3,
      t = mNext;
    if (s % 8 === 0) mNeonOn = neo > 0.5;
    if (mNeonOn) {
      neonStep(s, t);
      mNext += NSPB;
      mStep++;
      continue;
    }
    if (s === 0) mMinor = st > 0.42;
    const R = mMinor ? ROOT_T : ROOT,
      C = mMinor ? CHT_T : CHT,
      ML = mMinor ? MEL_T : MEL,
      r = R[ch];
    if (st > 0.35) mnote(r + (s % 2 ? 12 : 0), t, spb * 0.9, 'triangle', 0.3);
    else if (s % 2 === 0) mnote(r + ((s >> 1) % 2 ? 12 : 0), t, spb * 1.7, 'triangle', 0.3);
    mnote(r + 24 + C[ch][ARP[s % 8]], t, spb * 0.9, 'square', 0.035);
    if (cx > 0.3) mnote(r + 24 + C[ch][(ARP[s % 8] + 2) % 4], t + spb / 2, spb * 0.45, 'square', 0.022);
    if (ML[s]) {
      mnote(ML[s], t, spb * 1.6, 'triangle', 0.16);
      if (cx > 0.5) mnote(ML[s] + (mMinor ? 3 : 4), t, spb * 1.4, 'square', 0.03);
    }
    if (cx > 0.75 && s % 8 === 0) [0, 1, 2].forEach((i) => mnote(r + 12 + C[ch][i], t, spb * 7.5, 'sine', 0.05));
    if (st > 0.25 && s % 4 === 0) mkick(t);
    if (st > 0.45 && s % 8 === 4) {
      mhat(t, 0.2);
      mnote(54, t, 0.08, 'triangle', 0.1);
    }
    if (s % 2 === 1) mhat(t, 0.05);
    if (st > 0.6) mhat(t + spb / 2, 0.035);
    if (st > 0.7 && (s % 8 === 0 || s % 8 === 3)) mnote(r - 12, t, spb * 2, 'sine', 0.4);
    mNext += spb;
    mStep++;
  }
}
function startMusic() {
  if (mTimer) return;
  const a = ac();
  if (!a) return;
  mBus = a.createGain();
  mBus.gain.value = 0;
  mBus.connect(a.destination);
  const n = (a.sampleRate * 0.05) | 0;
  hatBuf = a.createBuffer(1, n, a.sampleRate);
  const d = hatBuf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  mNext = a.currentTime + 0.1;
  mTimer = setInterval(musTick, 90);
}
const snd = document.getElementById('snd');
function setSnd() {
  snd.textContent = muted ? '\uD83D\uDD07 Sound off' : '\uD83D\uDD0A Sound on';
}
snd.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  e.preventDefault();
  muted = !muted;
  try {
    localStorage.setItem('flappymute', muted ? '1' : '0');
  } catch (x) {}
  setSnd();
  ac();
});
setW();
setSnd();
