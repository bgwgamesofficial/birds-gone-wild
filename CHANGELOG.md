# Changelog

Versions are `0.UPDATE.CHANGE` (e.g. v0.4.11). The last number goes up with every single change;
the middle number goes up each time an update goes live. Each section below is one update.

## v0.6 (in progress on `hawk-test`)
- Infinite Run gets the anti-camping fix too: riding the clouds/ceiling now brings hawks up there fast (about
  30-40 hits a minute for a camper, was 4-7). Normal play is unchanged. (v0.6.9)
- Two game modes, chosen on the start screen (v0.6.8):
  - Infinite Run: the original endless game, exactly as live in v0.5.4 (verified frame-by-frame against it).
  - Boss Run: the new 50-level game (hearts, bosses, butterfly levels, smarter hawks).
  Each mode keeps its own coins, progress and best score; existing players' progress becomes their Infinite Run.
- 8 butterflies now make one heart (was 5). (v0.6.7)
- Hearts: every hawk hit costs a heart (and coins); no hearts left = game over. Each level starts with at least
  2 hearts (3 on levels 1-3); butterflies add hearts up to 3. Being broke no longer kills you. (v0.6.6)
- Hawk rule is now 5: the number of hawks allowed at you at once grows with the level (1 early on, up to 5 near
  the end; butterfly levels at most 2). (v0.6.6)
- Bosses about 40% harder (measured with a simulated player) and more of them: level 10 one Hawk Chief,
  20-30 Chief + Captain (smaller, easier), 40 Chief + 2 Captains, 50 two Chiefs + a Captain. (v0.6.6)
- Difficulty curve re-tuned with a simulated player (48+ simulated runs): levels 1-12 nearly always cleared,
  about 80% reach 20, 45% reach 30, 15% reach 40, a few % reach 45, nobody cleared 50. (v0.6.6)
- No more ceiling camping: hawks can fly right up to the ceiling, aim straight at a bird riding the clouds or the
  top, and spawn rapidly up in the clouds when you stay there (about 30-40 hits a minute for a camper). (v0.6.5)
- Independent hawks: every hawk keeps changing its mind on its own (hunt, climb, dive, feint, hover, burst) and may
  change its aim once more after locking on (the ! moves with it). The 3-hawk rule now means never more than 3
  hawks coming at you at once, U-turns and the boss included. (v0.6.5)
- Boss levels much harder: 9-14 passes, the Hawk Chief flies faster, speeds up again after half, turns sooner,
  brings an escort hawk from the other side on each turn, and more small hawks join in. (v0.6.5)
- Butterfly levels: twice as many butterflies to catch (12-22); on those levels butterflies spot you earlier,
  predict your fall, pick the roomier side, dart away and hover or rush to spoil your timing. (v0.6.5)
- Test builds only: a level picker on the start screen (start at any level 1-50). (v0.6.5)
- Dying (game over) now sends you back to level 1; coins and upgrades are kept. Reviving keeps your level. (v0.6.4)
- Settings: "Reset best score" button (tap twice to confirm). (v0.6.4)
- 10% harder across the board: every level's difficulty is about 10% higher and hawks come about 10% more often;
  the fairness limits stay. (v0.6.3)
- Smarter hawks (v0.6.3): they predict where you will fall between flaps, swoop in from above or below, one
  hawk in a group cuts off the direction you are heading, and hawks that miss may bank into a U-turn and come back
  once (more often on higher levels; counted and paid only once). The red ! now shows where a hawk will cross.
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
