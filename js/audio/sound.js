// Sound effects (synthesised with WebAudio).
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

// sound (synthesized with WebAudio)
let AC = null,
  muted = false;
try {
  muted = localStorage.getItem('flappymute') === '1';
} catch (e) {}
function ac() {
  if (!AC) {
    try {
      AC = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {}
  }
  if (AC && AC.state === 'suspended') AC.resume();
  return AC;
}
function tone(f1, f2, dur, type, vol, delay) {
  const a = ac();
  const sv = SV();
  if (!a || sv <= 0) return;
  vol = Math.max(0.0011, vol * sv);
  const t = a.currentTime + (delay || 0);
  const o = a.createOscillator(),
    g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f1, t);
  o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g);
  g.connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}
function noise(d, v) {
  const a = ac();
  const sv = SV();
  if (!a || sv <= 0) return;
  v *= sv;
  const n = (a.sampleRate * d) | 0,
    b = a.createBuffer(1, n, a.sampleRate),
    da = b.getChannelData(0);
  for (let i = 0; i < n; i++) da[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = a.createBufferSource(),
    g = a.createGain();
  g.gain.value = v;
  s.buffer = b;
  s.connect(g);
  g.connect(a.destination);
  s.start();
}
const sfx = {
  flap() {
    tone(380, 760, 0.12, 'triangle', 0.18);
  },
  coin() {
    tone(988, 988, 0.08, 'square', 0.08);
    tone(1319, 1319, 0.22, 'square', 0.08, 0.07);
  },
  score() {
    tone(660, 880, 0.12, 'sine', 0.12);
  },
  shield() {
    tone(300, 900, 0.25, 'sawtooth', 0.12);
    tone(900, 1200, 0.2, 'triangle', 0.1, 0.1);
  },
  buy() {
    tone(700, 700, 0.06, 'square', 0.08);
    tone(1050, 1050, 0.12, 'square', 0.08, 0.06);
  },
  level() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.18, 'square', 0.09, i * 0.09));
  },
  steal() {
    tone(520, 140, 0.3, 'sawtooth', 0.14);
    noise(0.15, 0.15);
  },
  crash() {
    noise(0.4, 0.3);
    tone(220, 50, 0.5, 'sawtooth', 0.18);
  },
};
