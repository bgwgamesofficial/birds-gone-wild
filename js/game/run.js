// Run lifecycle: reset() for a new round, die() when hit (hearts/shield), restart, revive and game over.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

// restart
function restartGame() {
  offer = false;
  paused = false;
  hold = false;
  cntEl.style.fontSize = '';
  lvlOpen = false;
  shopOpen = false;
  shopEl.classList.remove('on');
  pending = 0;
  revives = 0;
  pauseEl.classList.remove('on');
  lvlEl.classList.remove('on');
  cntEl.textContent = '';
  level = 1;
  xp = 0;
  Object.keys(perks).forEach((k) => {
    perks[k] = 0;
  });
  saveProg();
  updXp();
  wallet = 0;
  saveW();
  reset();
  state = 'ready';
  showCard('Birds Gone Wild', '<p>Fresh start. <b>Tap</b>, click or press <b>Space</b> to flap.</p>');
  msg.style.display = 'flex';
}
const rb = document.getElementById('rbtn');
let rbT = 0;
rb.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  e.preventDefault();
  ac();
  if (shopOpen || lvlOpen || setOpen) return;
  if (state === 'play') {
    if (rbT) {
      clearTimeout(rbT);
      rbT = 0;
      rb.textContent = '\u21BB Restart';
      rb.classList.remove('sure');
      restartGame();
    } else {
      rb.textContent = 'Tap again';
      rb.classList.add('sure');
      rbT = setTimeout(() => {
        rbT = 0;
        rb.textContent = '\u21BB Restart';
        rb.classList.remove('sure');
      }, 2500);
    }
  } else restartGame();
});

// revive + game over
function reviveCost() {
  return 10 * Math.pow(2, revives) * MM();
}
function doRevive() {
  const c = reviveCost();
  if (wallet < c || !offer) return;
  wallet -= c;
  revives++;
  saveW();
  sfx.level();
  offer = false;
  msg.style.display = 'none';
  let t = null;
  pipes.forEach((p) => {
    if (p.z < 1.5 && (!t || p.z > t.z)) t = p;
  });
  y = t ? t.gy : 1;
  camY = 3.5 + y * 0.7;
  camL = y * 0.85;
  vy = 0;
  tilt = 0;
  state = 'play';
  speed = SPEED;
  ghost = gt + 2.5;
  shake = 0;
  paused = true;
  hold = true;
  cntEl.style.fontSize = '30px';
  cntEl.textContent = 'Tap or press Space to continue';
  popText('Revived!');
  updFx();
}
function gameOverInf() {
  // Infinite Run: as live v0.5.4 (wipes coins, level and upgrades)
  Object.keys(inv).forEach((k) => {
    inv[k] = 0;
  });
  saveInv(); // no leftover shop items either
  offer = false;
  const lv = level;
  level = 1;
  xp = 0;
  pending = 0;
  Object.keys(perks).forEach((k) => {
    perks[k] = 0;
  });
  revives = 0;
  fx = {};
  ghost = 0;
  wallet = 0;
  saveW();
  saveProg();
  updXp();
  updFx();
  showCard(
    'Game over',
    '<p>Score: <b>' +
      score +
      '</b> &nbsp; Coins: <b>+$' +
      fm(run) +
      '</b></p><p>You reached level ' +
      lv +
      '. Your wallet, level and upgrades have been reset.</p><p>Tap Restart to start over.</p><button id="restartbtn">&#8635; Restart</button>',
  );
  msg.style.display = 'flex';
}
function gameOver() {
  if (!BR) return gameOverInf();
  offer = false;
  const lv = level;
  lvProg = 0;
  freshRun(); // dying resets everything: level 1, $0, no upgrades
  fx = {};
  ghost = 0;
  setW();
  updXp();
  updFx();
  showCard(
    'Game over',
    '<p>You reached <b>level ' +
      lv +
      '</b>. &nbsp; Score: <b>' +
      score +
      '</b> &nbsp; Coins: <b>+$' +
      fm(run) +
      '</b></p><p>Everything resets: back to level 1 with $0 and no upgrades.</p><button id="againbtn">&#9654; Try again</button>',
  );
  msg.style.display = 'flex';
}
function reset() {
  pipes.forEach((p) => {
    scene.remove(p.g);
    p.pm.p.dispose();
    p.pm.c.dispose();
  });
  pipes.length = 0;
  foes.forEach((f) => scene.remove(f.g));
  foes.length = 0;
  neonReset();
  clearFlies();
  flyT = 3;
  lifePts = 0;
  updLife();
  lastBase = 2.5;
  hawkT = 2.2;
  lastDir = 0;
  dirRun = 0;
  AI.y = 1;
  AI.skill = 0.5;
  HAB.fill(0);
  if (mode !== 5) for (let i = 0; i < 7; i++) pipes.push(makePipe(-25 - i * SPACING));
  cdEnd = 0;
  lvProg = 0;
  lvSpawned = 0;
  bossOut = false;
  updXp();
  used = {};
  RS = 0;
  y = 1;
  camY = 3.2;
  vy = 0;
  score = 0;
  speed = 0;
  tilt = 0;
  run = 0;
  gt = 0;
  incT = 0;
  fx = {};
  ghost = 0;
  tod0 = Math.random();
  hud.textContent = '0';
}
function die() {
  if (state === 'dead' || gt < ghost) return;
  if (fx.shield) {
    fx.shield = false;
    ghost = gt + 1.5;
    vy = FLAP * 1.1;
    y = Math.max(BOT + 0.8, Math.min(CEIL - 0.3, y));
    shake = 0.5;
    sfx.shield();
    burst(0, y, 0, 26, 0x7fd0ff, 5, 0.8);
    updFx();
    return;
  }
  if (mode === 5 && lifePts >= LIFE_SEG) {
    lifePts -= LIFE_SEG;
    ghost = gt + 1.5;
    vy = FLAP * 1.1;
    y = Math.max(BOT + 0.8, Math.min(CEIL - 0.3, y));
    shake = 0.5;
    sfx.shield();
    burst(0, y, 0, 26, 0xff7aa8, 5, 0.8);
    popText(
      lifePts >= LIFE_SEG
        ? 'Ouch! ' + Math.floor(lifePts / LIFE_SEG) + ' heart' + (lifePts >= 2 * LIFE_SEG ? 's' : '') + ' left'
        : 'Last heart!',
      '#ff7aa8',
    );
    updLife();
    return;
  }
  state = 'dead';
  time = 0;
  speed = 0;
  shake = 0.6;
  sfx.crash();
  burst(0, y, 0, 44, COLORS[birdCol][0], 7, 1.2);
  if (score > best) {
    best = score;
    try {
      localStorage.setItem(bkey(), best);
    } catch (e) {}
  }
  if (wallet >= reviveCost()) {
    offer = true;
    card.innerHTML =
      '<h1>Crash!</h1><p>Score: <b>' +
      score +
      '</b> &nbsp; Level: <b>' +
      level +
      '</b></p><p>' +
      (BR
        ? 'Revive to keep going from here (' + lvProg + '/' + lvNeed() + '). Give up and you go back to level 1.'
        : 'Revive now to keep your score, level and upgrades. Give up and you start over from zero.') +
      '</p><button id="revbtn">&#10084;&#65039; Revive for $' +
      reviveCost() +
      '</button> <button id="giveup">Give up</button><p>Wallet: <b>$' +
      fm(wallet) +
      '</b></p>';
    msg.style.display = 'flex';
  } else gameOver();
}
