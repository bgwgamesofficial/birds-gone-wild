// Start screen: logo, Download App button, mode choice, start countdown.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

card.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
}); // touching the menu card never flaps, so it can be scrolled
card.addEventListener('click', (e) => {
  if (e.target.closest('.sw')) {
    birdCol = e.target.closest('.sw').dataset.col;
    try {
      localStorage.setItem('flappycolor', birdCol);
    } catch (x) {}
    setBirdColor(birdCol);
    card.querySelectorAll('.sw').forEach((b) => b.classList.toggle('on', b.dataset.col === birdCol));
  } else if (e.target.closest('.md')) {
    mode = +e.target.closest('.md').dataset.m;
    try {
      localStorage.setItem('flappymode', mode);
    } catch (x) {}
    applyMode();
    reset();
    card.querySelectorAll('.md').forEach((b) => b.classList.toggle('on', +b.dataset.m === mode));
    const cp = card.querySelector('#modecap');
    if (cp) cp.textContent = modeCap();
    const bs = card.querySelector('#best');
    if (bs) bs.innerHTML = 'Best: ' + best + ' &nbsp; Wallet: <b class="wv">$' + fm(wallet) + '</b>';
  } else if (e.target.closest('.gm')) {
    setGame(e.target.closest('.gm').dataset.g === 'boss');
  } else if (e.target.closest('#againbtn')) {
    reset();
    state = 'ready';
    showCard('Birds Gone Wild', '<p><b>Tap</b>, click or press <b>Space</b> to flap.</p>');
  } else if (e.target.closest('#dlbtn')) {
    downloadApp();
  } else if (e.target.closest('#setbtn')) {
    openSettings();
  } else if (e.target.closest('#startbtn')) {
    startGame();
  } else if (e.target.closest('#revbtn')) doRevive();
  else if (e.target.closest('#giveup')) gameOver();
  else if (e.target.closest('#restartbtn')) restartGame();
});
const LOGO = 'img/logo.jpg'; // start-screen logo
// "Download App": uses the browser's own install box when it offers one (Android Chrome/Edge/Samsung/Brave,
// desktop Chrome/Edge); otherwise opens the picture guide (install.html). Hidden once the game is installed.
let installEvt = null;
function isInstalled() {
  try {
    return (
      (typeof matchMedia === 'function' && matchMedia('(display-mode: standalone)').matches) ||
      (typeof navigator !== 'undefined' && navigator.standalone === true)
    );
  } catch (e) {
    return false;
  }
}
function hideDl() {
  const b = document.getElementById('dlbtn');
  if (b && b.remove) b.remove();
}
addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installEvt = e;
});
addEventListener('appinstalled', () => {
  installEvt = null;
  hideDl();
  popText('Installed! Find it on your home screen', '#7fe7ff');
});
function downloadApp() {
  if (installEvt) {
    const ev = installEvt;
    installEvt = null;
    ev.prompt();
    if (ev.userChoice)
      ev.userChoice
        .then((r) => {
          if (r && r.outcome === 'accepted') hideDl();
        })
        .catch(() => {});
  } else location.href = 'install.html';
}
function introText() {
  return BR
    ? '<p>Beat 50 levels: dodge hawks, catch butterflies and survive the bosses. Each hit costs a heart &#10084;&#65039; and losing them all ends the run.</p><p><b>Tap</b>, click or press <b>Space</b> to flap.</p>'
    : '<p>Dodge the hawks (watch for the red <b>!</b> warnings) and catch butterflies to fill your life bar. You earn coins the longer you survive.</p><p><b>Tap</b>, click or press <b>Space</b> to flap.</p>';
}
function setGame(b) {
  if (b === BR) return;
  BR = b;
  try {
    localStorage.setItem('flappygame', b ? 'boss' : 'inf');
  } catch (e) {}
  loadProg();
  freshRun();
  try {
    best = +localStorage.getItem(bkey()) || 0;
  } catch (e) {}
  reset();
  setW();
  updXp();
  updLife();
  showCard('Birds Gone Wild', introText());
}
function showCard(title, body) {
  const T = title === 'Birds Gone Wild';
  card.classList.toggle('cols', T);
  card.innerHTML =
    (T ? '<div class="cl">' : '') +
    (title === 'Birds Gone Wild'
      ? '<img class="logo" alt="Birds Gone Wild" src="' + LOGO + '">'
      : '<h1>' + title + '</h1>') +
    body +
    (T && BR
      ? '<p class="lvlnow">Level <b>' + level + '</b> of ' + LVL_MAX + ' &middot; ' + lvGoalTxt() + '</p>'
      : '') +
    '<p id="best">Best: ' +
    best +
    ' &nbsp; Wallet: <b class="wv">$' +
    fm(wallet) +
    '</b></p>' +
    (title === 'Birds Gone Wild'
      ? '</div><div class="cr"><p>Bird color</p><div id="swatches">' +
        Object.keys(COLORS)
          .map(
            (k) =>
              '<button class="sw' +
              (k === birdCol ? ' on' : '') +
              '" data-col="' +
              k +
              '" aria-label="' +
              k +
              ' bird" style="background:#' +
              COLORS[k][0].toString(16).padStart(6, '0') +
              '"></button>',
          )
          .join('') +
        '</div><div id="gmodes"><button class="gm' +
        (BR ? '' : ' on') +
        '" data-g="inf">&#9854;&#65039; Infinite Run</button><button class="gm' +
        (BR ? ' on' : '') +
        '" data-g="boss">&#128081; Boss Run</button></div><button id="startbtn">Start</button> <div class="cardrow">' +
        (isInstalled() ? '' : '<button id="dlbtn" class="ghost">&#128242; Download App</button>') +
        '<button id="setbtn" class="ghost">&#9881; Settings</button></div><p class="ver">' +
        VER_TXT +
        '</p></div>'
      : '');
  const lg = card.querySelector('.logo');
  if (lg && lg.addEventListener) lg.addEventListener('load', fitMenus);
  fitMenus();
}
let cdHop = false;
function countdown(hop) {
  showBanner();
  paused = true;
  cdHop = hop;
  cdEnd = Math.max(last, performance.now()) + 3000;
  cdLast = -1;
} // 3-2-1-GO, game frozen meanwhile (same clock as the frame loop)
function startGame() {
  if (state !== 'ready' || cdEnd) return;
  freshRun();
  setW();
  updXp();
  ac();
  startMusic();
  msg.style.display = 'none';
  state = 'play';
  speed = SPEED;
  useItems();
  y = 1;
  vy = 0;
  levelHearts();
  countdown(true);
}
function cdTick(now) {
  // runs the 3-2-1-GO countdown
  const left = Math.min(3, Math.ceil((cdEnd - now) / 1000));
  if (left !== cdLast && left > 0) {
    cdLast = left;
    cdShow(left);
    tone(520, 520, 0.12, 'square', 0.09);
  }
  if (now >= cdEnd) {
    cdEnd = 0;
    cdShow('GO!');
    tone(880, 1320, 0.2, 'square', 0.09);
    setTimeout(() => {
      if (cntEl.textContent === 'GO!') cntEl.textContent = '';
    }, 600);
    if (!setOpen && !shopOpen && !lvlOpen) paused = false;
    if (cdHop) {
      cdHop = false;
      vy = FLAP;
      sfx.flap();
      flapAt = performance.now();
    }
  }
}
