// Shop items, perk texts for Hawk mode, active item effects and game speed `sp()`.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

// marketplace
const ITEMS = [
  {
    id: 'shield',
    icon: '\uD83D\uDEE1\uFE0F',
    name: 'Shield',
    price: 15,
    dur: 0,
    desc: 'Survives one crash: bounces you back and lets you phase through for 1.5s.',
  },
  {
    id: 'magnet',
    icon: '\uD83E\uDDF2',
    name: 'Coin Magnet',
    price: 20,
    dur: 25,
    desc: 'Pulls in coins ahead of you for 25 seconds.',
  },
  {
    id: 'double',
    icon: '\u2728',
    name: 'Double Coins',
    price: 25,
    dur: 25,
    desc: 'Every coin is worth twice as much for 25 seconds.',
  },
  {
    id: 'slow',
    icon: '\uD83D\uDC22',
    name: 'Slow-Mo',
    price: 30,
    dur: 20,
    desc: 'Pipes move 35% slower for 20 seconds.',
  },
  {
    id: 'feather',
    icon: '\uD83E\uDEB6',
    name: 'Featherweight',
    price: 35,
    dur: 25,
    desc: 'Lighter gravity and softer falls for 25 seconds.',
  },
];
const HITEM = {
  shield: {
    name: 'Hawk Shield',
    desc: 'Survives one hawk strike or crash: bounces you back and lets you phase through for 1.5s.',
  },
  magnet: {
    icon: '\uD83D\uDCE1',
    name: 'Hawk Blinder',
    desc: 'Hawks lose track of you and fly a straight line for 25 seconds.',
  },
  double: { icon: '\uD83C\uDFAF', name: 'Bounty Hunter', desc: 'Every hawk you dodge pays double for 25 seconds.' },
  slow: { name: 'Hawk Slow-Mo', desc: 'Hawks fly 45% slower for 20 seconds.' },
  feather: { desc: 'Lighter gravity and softer falls for 25 seconds, so dodging over and under hawks is easier.' },
};
const HPERK = {
  pull: { icon: '\uD83C\uDFAF', name: 'Bounty Boost', desc: '+25% reward for every hawk you dodge. Stacks.' },
  lucky: { name: 'Lucky Dodge', desc: '+15% chance a dodged hawk pays double. Stacks.' },
  steady: { icon: '\uD83E\uDD85', name: 'Slow Hawks', desc: 'Hawks fly 6% slower. Stacks.' },
  slim: { desc: 'A smaller hitbox for squeezing past hawks. Stacks.' },
  guard: { desc: 'Every run starts with a free hawk shield.' },
};
function iv(it) {
  return mode === 5 && HITEM[it.id] ? Object.assign({}, it, HITEM[it.id]) : it;
}
function pv(p) {
  return mode === 5 && HPERK[p.id] ? Object.assign({}, p, HPERK[p.id]) : p;
}
function fxOn(id) {
  return fx[id] > gt;
}
function sp() {
  return (
    speed *
    (fxOn('slow') ? 0.65 : 1) *
    (1 - 0.06 * perks.steady) *
    (1 + Math.min(0.45, gt * 0.0025)) *
    MODES[mode - 1].s
  );
}
function useItems() {
  ITEMS.forEach((it) => {
    if (inv[it.id] > 0) {
      inv[it.id]--;
      used[it.id] = (used[it.id] || 0) + 1;
      if (it.id === 'shield') fx.shield = true;
      else fx[it.id] = gt + it.dur;
    }
  });
  if (perks.guard) fx.shield = true;
  saveInv();
  updFx();
}
const fxEl = document.getElementById('fx');
let fxLast = '';
function updFx() {
  let s = '';
  ITEMS.map(iv).forEach((it) => {
    if (it.id === 'shield') {
      if (fx.shield) s += '<span>' + it.icon + '</span>';
    } else if (fx[it.id] > gt) s += '<span>' + it.icon + ' ' + Math.ceil(fx[it.id] - gt) + 's</span>';
  });
  if (ghost > gt) s += '<span>👻 ' + Math.ceil(ghost - gt) + 's</span>';
  if (s !== fxLast) {
    fxLast = s;
    fxEl.innerHTML = s;
  }
}
