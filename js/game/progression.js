// Permanent perks, XP (Infinite Run) and the upgrade menu.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

// permanent perks + levelling
const pauseEl = document.getElementById('pause'),
  cntEl = document.getElementById('count'),
  lvlEl = document.getElementById('lvl'),
  xpEl = document.getElementById('xp');
const PERKS = [
  { id: 'pull', icon: '🧲', name: 'Coin Pull', max: 3, desc: 'Coins drift toward you from farther away. Stacks.' },
  { id: 'lucky', icon: '🍀', name: 'Lucky Coins', max: 4, desc: '+15% chance each coin is worth double. Stacks.' },
  { id: 'wings', icon: '🪶', name: 'Light Wings', max: 4, desc: '7% lower gravity. Stacks.' },
  { id: 'steady', icon: '🐢', name: 'Steady Pipes', max: 4, desc: 'Pipes move 6% slower. Stacks.' },
  { id: 'slim', icon: '🕊️', name: 'Slim Frame', max: 3, desc: 'A smaller hitbox for forgiving close calls. Stacks.' },
  { id: 'learner', icon: '📘', name: 'Fast Learner', max: 3, desc: '+35% XP from everything. Stacks.' },
  { id: 'guard', icon: '🛡️', name: 'Guardian', max: 1, desc: 'Every run starts with a free shield.' },
];
function HB() {
  return Math.max(0.15, 0.4 - 0.1 * perks.slim + MODES[mode - 1].hb);
}
function need(l) {
  return 10 + 6 * l * l;
}
function updXp() {
  if (!BR) {
    xpEl.innerHTML =
      '<span>Lv ' +
      level +
      ' &middot; ' +
      Math.floor(xp) +
      '/' +
      need(level) +
      ' XP</span><div class="bar"><div class="fill" style="width:' +
      Math.min(100, (xp / need(level)) * 100) +
      '%"></div></div>';
    return;
  }
  const t = lvType(),
    n = lvNeed();
  xpEl.innerHTML =
    '<span>Level ' +
    level +
    ' &middot; ' +
    lvProg +
    '/' +
    n +
    (t === 'boss' ? ' boss passes' : t === 'fly' ? ' butterflies' : ' hawks') +
    '</span><div class="bar"><div class="fill" style="width:' +
    Math.min(100, (lvProg / n) * 100) +
    '%"></div></div>';
}
function gainXp(n) {
  if (BR) return; // Boss Run: levels come from levelComplete()
  xp += n * MM() * (1 + 0.35 * perks.learner);
  let up = false;
  while (xp >= need(level)) {
    xp -= need(level);
    level++;
    pending++;
    up = true;
  }
  saveProg();
  updXp();
  if (up && !lvlOpen) showLevelUp();
}
function renderLvl() {
  lvlEl.innerHTML =
    '<div class="panel"><h2>' +
    (BR ? 'Level ' + lvlDoneN + ' complete!' : 'Level ' + (level - pending + 1) + '!') +
    '</h2><p class="sub">Choose one permanent upgrade.' +
    (BR ? ' Next: level ' + level + '.' : '') +
    '</p>' +
    lvlCh
      .map(pv)
      .map(
        (p) =>
          '<button class="perk' +
          (lvlSel === p.id ? ' sel' : '') +
          '" data-perk="' +
          p.id +
          '"><span class="ic">' +
          p.icon +
          '</span><span><b>' +
          p.name +
          '</b>' +
          (p.max > 1 ? ' <i>(Lv ' + (perks[p.id] + 1) + '/' + p.max + ')</i>' : '') +
          '<br><small>' +
          p.desc +
          '</small></span><span class="chk"></span></button>',
      )
      .join('') +
    '<div class="foot"><button id="lvlset" class="gear" aria-label="Settings">&#9881;&#65039;</button><button id="lvldone" class="main"' +
    (lvlSel ? '' : ' disabled') +
    '>' +
    (lvlSel ? 'Complete &#10003;' : 'Pick an upgrade') +
    '</button></div></div>';
}
function showLevelUp() {
  paused = true;
  lvlOpen = true;
  const av = PERKS.filter((p) => perks[p.id] < p.max && (!BR || p.id !== 'learner')).sort(() => Math.random() - 0.5);
  const ch = av.slice(0, 3);
  if (ch.length < 3)
    ch.push({ id: 'cash', icon: '💎', name: 'Treasure', max: 1, desc: 'A $50 bonus for your wallet.' });
  lvlStage = 'shop';
  lvlSel = null;
  lvlCh = ch;
  if (BR) wsNew();
  openShop();
  sfx.level();
}
lvlEl.addEventListener('pointerdown', (e) => e.stopPropagation());
lvlEl.addEventListener('click', (e) => {
  if (e.target.closest('#lvlset')) {
    openSettings();
    return;
  }
  const pk = e.target.closest('[data-perk]');
  if (pk) {
    lvlSel = pk.dataset.perk;
    sfx.buy();
    renderLvl();
    return;
  }
  if (e.target.closest('#lvldone')) {
    if (!lvlSel) return;
    const id = lvlSel;
    if (id === 'cash') {
      wallet += 50;
      saveW();
    } else perks[id]++;
    saveProg();
    sfx.buy();
    pending--;
    lvlSel = null;
    lvlEl.classList.remove('on');
    lvlOpen = false;
    if (pending > 0) showLevelUp();
    else resumeGame();
  }
});
