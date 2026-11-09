// The Marketplace and Step 1 "Wave Shop" (Boss Run offers, reroll, lock).
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

const shopEl = document.getElementById('shop');
// ===== STEP 1 "WAVE SHOP" (Boss Run only) =====
// After every level the marketplace shows WS_N random offers. Reroll swaps the unlocked offers (price goes up each
// time, back to the start price in the next shop). Lock keeps an offer for the next shop. Infinite Run is unchanged.
const WS_N = 3;
function wsCount(id) {
  return (inv[id] || 0) + (used[id] || 0);
}
function wsFill() {
  const keep = wsOff.filter((o) => o.lock && !o.sold && wsCount(o.id) < 9),
    ids = keep.map((o) => o.id);
  const pool = ITEMS.filter((it) => ids.indexOf(it.id) < 0 && wsCount(it.id) < 9).sort(() => Math.random() - 0.5);
  wsOff = keep.slice();
  while (wsOff.length < WS_N && pool.length) wsOff.push({ id: pool.shift().id, lock: false, sold: false });
}
function wsNew() {
  wsRr = 0;
  wsFill();
} // a fresh shop after a level (locked offers stay)
function wsRrPrice() {
  return Math.round((1 + wsRr) * MM());
}
function wsReroll() {
  const c = wsRrPrice();
  if (wallet < c) return;
  wallet -= c;
  wsRr++;
  wsOff.forEach((o) => {
    if (!o.lock || o.sold) o.drop = true;
  });
  wsOff = wsOff.filter((o) => !o.drop);
  wsFill();
  saveW();
  sfx.buy();
  renderShop();
}
function wsItem(it, slot, o) {
  const n = wsCount(it.id),
    mx = n >= 9,
    sold = o && o.sold,
    lk = o && o.lock;
  return (
    '<div class="item' +
    (sold ? ' sold' : '') +
    (lk ? ' locked' : '') +
    '"><div class="ic">' +
    it.icon +
    '</div><div class="tx"><b>' +
    it.name +
    '</b>' +
    (n ? '<span class="own">x' + n + '</span>' : '') +
    '<small>' +
    it.desc +
    '</small></div>' +
    (o && !sold
      ? '<button class="lock" data-lock="' +
        slot +
        '" aria-label="' +
        (lk ? 'Unlock' : 'Lock') +
        '" title="' +
        (lk ? 'Locked: stays for the next shop' : 'Lock: keep this for the next shop') +
        '">' +
        (lk ? '&#128274;' : '&#128275;') +
        '</button>'
      : '') +
    '<button class="buy" data-buy="' +
    it.id +
    '"' +
    (slot >= 0 ? ' data-slot="' + slot + '"' : '') +
    (sold || wallet < pr(it) || mx ? ' disabled' : '') +
    '>' +
    (sold ? 'Sold' : mx ? 'Max' : '$' + pr(it)) +
    (slot >= 0 ? '<span class="kb">' + (slot + 1) + '</span>' : '') +
    '</button></div>'
  );
}
function shopNext() {
  shopOpen = false;
  shopEl.classList.remove('on');
  if (lvlStage === 'wsonly') {
    lvlOpen = false;
    lvlStage = 'shop';
    resumeGame();
    return;
  }
  lvlStage = 'perk';
  renderLvl();
  lvlEl.classList.add('on');
}
function renderShop() {
  const ws = BR && mode === 5;
  if (ws && !wsOff.length) wsFill();
  const list = ws
    ? wsOff.map((o, i) => wsItem(iv(ITEMS.find((t) => t.id === o.id)), i, o)).join('') +
      (wsOff.length ? '' : '<p class="note">You have every item at its maximum.</p>')
    : ITEMS.map(iv)
        .map((it) => wsItem(it, -1, null))
        .join('');
  const next = lvlOpen && (lvlStage === 'shop' || lvlStage === 'wsonly'),
    rc = wsRrPrice();
  shopEl.innerHTML =
    '<div class="panel"><div class="ph"><h2>Marketplace</h2><span class="bal">&#128176; $' +
    fm(wallet) +
    '</span></div><div class="items">' +
    list +
    '</div><p class="note">' +
    (ws
      ? 'New offers after every level. &#128275; Lock keeps an offer for the next shop. Items start right away.'
      : 'Items you buy activate right away and last for the rest of this game.') +
    '</p><div class="foot"><button id="shopset" class="gear" aria-label="Settings">&#9881;&#65039;</button>' +
    (ws
      ? '<button id="shopreroll" class="rr"' +
        (wallet < rc ? ' disabled' : '') +
        '>&#127922; $' +
        rc +
        '<span class="kb">R</span></button>'
      : '') +
    (next
      ? '<button id="shopnext" class="main">Next &#9654;' + (ws ? '<span class="kb">Enter</span>' : '') + '</button>'
      : '<button id="shopclose" class="main">Close' + (ws ? '<span class="kb">Enter</span>' : '') + '</button>') +
    '</div></div>';
}
function openShop() {
  shopOpen = true;
  renderShop();
  shopEl.classList.add('on');
}
function closeShop() {
  shopOpen = false;
  shopEl.classList.remove('on');
  if (state === 'play' && paused && !lvlOpen) pauseEl.classList.add('on');
  document.querySelectorAll('.wv').forEach((e) => {
    e.textContent = '$' + fm(wallet);
  });
}
shopEl.addEventListener('pointerdown', (e) => e.stopPropagation());
addEventListener('keydown', (e) => {
  if (!shopOpen || setOpen || !BR) return;
  const q = (k) => shopEl.querySelector(k);
  let b = null;
  const m = /^(Digit|Numpad)([1-9])$/.exec(e.code); // PC keys for the shop: 1-3 buy, R reroll, Enter next/close
  if (e.code === 'KeyR') b = q('#shopreroll');
  else if (e.code === 'Enter' || e.code === 'NumpadEnter') b = q('#shopnext') || q('#shopclose');
  else if (m) b = q('[data-slot="' + (m[2] - 1) + '"]');
  if (b && !b.disabled) {
    e.preventDefault();
    b.click();
  }
});
shopEl.addEventListener('click', (e) => {
  if (e.target === shopEl) {
    if (!lvlOpen) closeShop();
    return;
  }
  if (e.target.closest('#shopnext')) {
    shopNext();
    return;
  }
  const b = e.target.closest('button');
  if (!b) return;
  if (b.id === 'shopclose') {
    closeShop();
    return;
  }
  if (b.id === 'shopset') {
    openSettings();
    return;
  }
  if (b.id === 'shopreroll') {
    wsReroll();
    return;
  }
  if (b.dataset.lock !== undefined) {
    const o = wsOff[+b.dataset.lock];
    if (o) {
      o.lock = !o.lock;
      sfx.buy();
      renderShop();
    }
    return;
  }
  const it = ITEMS.find((i) => i.id === b.dataset.buy);
  if (it && wallet >= pr(it) && (inv[it.id] || 0) + (used[it.id] || 0) < 9) {
    const o = b.dataset.slot !== undefined ? wsOff[+b.dataset.slot] : null;
    if (o && o.sold) return;
    if (o) {
      o.sold = true;
      o.lock = false;
    }
    wallet -= pr(it);
    if (state === 'play') {
      used[it.id] = (used[it.id] || 0) + 1;
      if (it.id === 'shield') fx.shield = true;
      else fx[it.id] = gt + it.dur;
    } else inv[it.id]++;
    saveW();
    saveInv();
    sfx.buy();
    renderShop();
    updFx();
  }
});
