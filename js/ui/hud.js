// Wallet display and floating text.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

// wallet
const wEl = document.getElementById('wallet');
function fm(n) {
  return String(parseFloat(n.toFixed(2)));
}
function setW() {
  wEl.textContent = '\uD83D\uDCB0 $' + fm(wallet);
}
function saveW() {
  try {
    localStorage.setItem(wkey(), wallet);
  } catch (e) {}
  setW();
}
function popText(t, col) {
  const d = document.createElement('div');
  d.className = 'pop';
  d.textContent = t;
  if (col) d.style.color = col;
  document.body.appendChild(d);
  requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('go')));
  setTimeout(() => d.remove(), 900);
}
