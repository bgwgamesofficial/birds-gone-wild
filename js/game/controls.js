// Flapping, keyboard/touch input and window resize.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

// Every menu must fit on screen without scrolling: shrink any open panel that is too big.
function fitEl(el) {
  if (!el || !el.offsetHeight) return;
  el.style.maxHeight = 'none';
  el.style.overflow = 'hidden';
  const s = Math.min(1, (innerHeight - 20) / el.offsetHeight, (innerWidth - 16) / el.offsetWidth);
  el.style.transform = s < 0.999 ? 'scale(' + s.toFixed(3) + ')' : '';
}
function fitMenus() {
  [
    card,
    pauseEl && pauseEl.querySelector('.panel'),
    shopEl && shopEl.querySelector('.panel'),
    lvlEl && lvlEl.querySelector('.panel'),
    setEl && setEl.querySelector('.panel'),
  ].forEach(fitEl);
}
function flap() {
  if (hold) {
    hold = false;
    paused = false;
    cntEl.textContent = '';
    cntEl.style.fontSize = '';
    ac();
    vy = FLAP;
    sfx.flap();
    flapAt = performance.now();
    return;
  }
  if (shopOpen || setOpen || paused) return;
  ac();
  startMusic();
  if (state === 'ready') return; // the game only starts from the Start button (startGame)
  if (state === 'play') {
    vy = FLAP;
    sfx.flap();
    flapAt = performance.now();
    burst(0, y - 0.2, 0.9, 6, 0xffffff, 2.2, 0.5);
  } else if (state === 'dead' && time > 0.5 && !offer) {
    reset();
    state = 'ready';
    showCard('Birds Gone Wild', '<p><b>Tap</b>, click or press <b>Space</b> to flap.</p>');
  }
}
addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    if (!e.repeat) flap();
  }
});
addEventListener('pointerdown', (e) => {
  if (state === 'ready' && msg.style.display !== 'none') return; // start screen: only the Start button (or Space) starts
  e.preventDefault();
  flap();
});
addEventListener('resize', () => {
  cam.aspect = innerWidth / innerHeight;
  cam.updateProjectionMatrix();
  applyRes();
  fitMenus();
});
