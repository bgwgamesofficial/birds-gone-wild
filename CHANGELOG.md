# Changelog

Versions are `0.UPDATE.CHANGE` (e.g. v0.4.11). The last number goes up with every single change;
the middle number goes up each time an update goes live. Each section below is one update.

## v0.6 (in progress on `hawk-test`)
- Levels redesigned to be short (about 25-60 s) and varied (v0.6.2), replacing the 200-hawk levels below:
  - Dodge levels: get past 17 (level 1) to 41 (level 49) hawks.
  - Butterfly levels (5, 15, 25, 35, 45): catch 6-11 butterflies; fewer hawks, more butterflies.
  - Boss levels (10, 20, 30, 40, 50): dodge the giant red Hawk Chief 6-10 times as it swoops back and forth.
  - Difficulty rises in waves: each block of 10 builds up to its boss; the level after a boss is a breather.
    Level 50 is about 95% of maximum. Fair limits: max 3 hawks per group, always a gap, every hawk settles its
    path at least ~0.9 s before reaching you.
  - Every level pays bonus coins; marketplace + upgrade every 5 levels, otherwise straight into a 3-2-1.
  - A banner at the start of each level shows the goal; the bottom bar shows progress.
- 50 levels. Each level = get past 200 hawks (hits you survive count too). Level 1 is very easy, level 50 nearly
  impossible: hawk speed, chasing strength, how late they lock their path, group size, hitbox and steal amount all
  rise with the level; feints from level 6, crossing pairs from 10, dashers from 14, sweepers from 20.
  Rounds take about 4.7 min on level 1 down to about 2.2 min on level 50; no timer. (v0.6.1)
- Finishing a level opens the marketplace and an upgrade choice, then a 3-2-1 into the next level. This replaces
  the old XP levels; "Fast Learner" is no longer offered. (v0.6.1)
- Game over keeps your level, coins and upgrades: you retry the same level. Pause > Restart (tap twice) starts
  over from level 1 with nothing. Start screen shows your level; the bottom bar shows hawks passed. (v0.6.1)

## v0.5 (live as v0.5.4, 2026-11-04) – level 5 only, Start countdown, menus fit the screen, Download App
- Start screen: "Download App" button. Opens the browser's own install box where available, otherwise the
  picture guide (install.html). Hidden once the game is installed. (v0.5.1)
- Fix: touching the start menu no longer starts the game, so the menu can be scrolled on short screens (e.g. the
  Galaxy Z Fold). On the start screen only the Start button (or Space) starts a game. (v0.5.2)
- Only the Start button starts a game (taps and Space no longer do), followed by a 3-2-1-GO countdown. (v0.5.3)
- No scrolling in any menu: menus fit the screen. On short wide screens the start menu, settings and shop use
  two or three columns; any menu that is still too big shrinks to fit. (v0.5.3)
- The game is now level 5 only: the difficulty buttons are gone and Start goes straight into it. Levels 1-4 are
  kept on the `classic-modes` branch. Your level-5 best score is kept. (v0.5.4)
- The pause button now works during every 3-2-1 countdown (start, after pause, after level-up); resuming starts a
  fresh countdown. (v0.5.4)
- New install guide page with Android screenshots: https://bgwgamesofficial.github.io/birds-gone-wild/install.html
  (already live).

## v0.4 (live as v0.4.11, 2026-11-04) – butterflies, life bar, Neon, prettier night, cleaner menus
- Level 5: small butterflies cross the lane like the hawks but steer away from you.
- Catching a butterfly fills the life bar under the score (5 butterflies = 1 life, up to 3 lives).
- A full life saves you from one crash: you bounce up with 1.5 seconds of safety.
- Level 5: ceiling raised from 16 to 20; a thin cloud layer starts at 16 and hides the toucan when you fly into it.
- Level 5: hawks are a bit easier (lock their path earlier, steer slower, fewer triple waves, slightly smaller hitbox).
- New random "Neon" look (all levels): dark purple sky, neon sun, glowing grid ground.
- Night (all levels): calm sky with softly twinkling stars, a bright cratered moon with a halo, soft blue moonlight
  and an occasional shooting star.
- New mountains (all levels): three curved layers with snow caps, haze at the base, moonlit edges at night and
  glowing outlines in Neon; they follow the road bend in level 5.
- Neon: its own upbeat synthwave music, glowing horizon, light strips along the road, neon-tinted trees,
  grid pulsing with the beat.
- Version numbers now have three parts and change with every change (v0.4.11); test links show "test build".
- Fix (all levels): the toucan could fall through the ground during the safety time after a shield, a life or a
  revive. The ground is now always solid; you bounce off it instead.
- Marketplace and level-up menus: bigger buy buttons (show "Max" when full), owned-count badges, tick circles on
  upgrades, one clear main button with a small settings button beside it.
- Cleaner menus (all levels): only Pause (and the camera button in levels 1–4) during play; sound, restart and
  settings moved into the pause menu; bigger Start button and easier colour/difficulty buttons.

## v0.3 – version number, automatic tests, testing guide
- Version number shown on the start screen.
- GitHub runs both tests automatically on every push (Actions tab).
- `TESTING.md`: plain steps for testing a change before it goes live.

## v0.2 – project notes and tests
- Project notes (`CLAUDE.md`) and tests added.

## v0.1 – first version on GitHub Pages
- Birds Gone Wild playable on GitHub Pages and installable to the home screen.
