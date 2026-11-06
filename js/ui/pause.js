// Pause menu, countdown helpers, camera view toggle and keyboard shortcuts.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

// pause + countdown
function pauseGame() {
  if (state !== 'play' || hold || shopOpen || lvlOpen || setOpen) return;
  if (paused && !cdEnd) return;
  if (cdEnd) {
    cdEnd = 0;
    cntEl.textContent = '';
  }
  paused = true;
  pauseEl.classList.add('on');
} // also works during a 3-2-1 countdown (it stops it)
function cdShow(t) {
  cntEl.textContent = t;
  cntEl.classList.remove('b');
  void cntEl.offsetWidth;
  cntEl.classList.add('b');
}
function resumeGame() {
  pauseEl.classList.remove('on');
  countdown(false);
}
pauseEl.addEventListener('pointerdown', (e) => e.stopPropagation());
document.getElementById('resume').addEventListener('click', resumeGame);
document.getElementById('pshop').addEventListener('click', () => {
  pauseEl.classList.remove('on');
  openShop();
});
document.getElementById('pset').addEventListener('click', () => {
  openSettings();
});
const cbtn = document.getElementById('cbtn');
function setView(v) {
  viewSide = v;
  cbtn.innerHTML = v || mode === 5 ? '\uD83C\uDFA5<span> Side</span>' : '\uD83C\uDFA5<span> Back</span>';
  cbtn.title = v || mode === 5 ? 'Camera: side (V)' : 'Camera: back (V)';
  try {
    localStorage.setItem('flappyview', v ? 'side' : 'back');
  } catch (e) {}
}
setView(viewSide);
document.getElementById('pver').textContent = VER_TXT;
cbtn.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  e.preventDefault();
  ac();
  setView(!viewSide);
});
document.getElementById('pbtn').addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  e.preventDefault();
  pauseGame();
});
addEventListener('keydown', (e) => {
  if (setOpen) {
    if (e.code === 'Escape') closeSettings();
    return;
  }
  if (e.code === 'KeyV') {
    setView(!viewSide);
    return;
  }
  if (e.code === 'KeyP' || e.code === 'Escape') {
    if (pauseEl.classList.contains('on')) resumeGame();
    else pauseGame();
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseGame();
});
updXp();
