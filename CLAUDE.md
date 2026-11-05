# Birds Gone Wild – project notes for Claude

## What this is
A 3D third-person flappy-bird game (toucan player, hawk enemies) built with Three.js r128.
It ships as a static web app on GitHub Pages and installs to phone home screens (PWA).
Live: https://bgwgamesofficial.github.io/birds-gone-wild/  (served from the `main` branch, root folder)

## About the owner
The owner is not a programmer. Explain things in plain words, give exact click-by-click steps for anything
done on github.com, and say plainly what you could not test. Claude cannot see the game rendered unless a
browser is available, so say "untested visually" instead of claiming it looks right. The owner tests on a
desktop browser and a Galaxy Z Fold.

## Files
- `index.html` – the entire game: HTML, CSS and one big script (`<script>\n(function(){ ... })();</script>`).
  Lines are very long. It also has the start-screen logo embedded as a base64 JPEG (`const LOGO=`).
- `sw.js` – service worker (offline). Pages: network first. Everything else (icons, Three.js from CDN): cache first.
- `manifest.webmanifest`, `icons/` – install info and icons (made from the logo).
- `tests/check.js` – syntax check. `tests/smoke.js` – headless stub run (4,000 simulated frames across modes 1–5).
- `tests/version.js` – fails if a game file changed but `VERSION` was not raised.
- `.nojekyll` – needed by GitHub Pages. Keep it.
- `.github/workflows/tests.yml` – GitHub Actions runs both tests on every push and pull request.
- `TESTING.md` – the owner's step-by-step guide for testing a branch and releasing it.
- `install.html` + `install/` – public "how to install" page (Android screenshots from the owner, cropped, with
  the tap target circled). Live at https://bgwgamesofficial.github.io/birds-gone-wild/install.html

## Rules of the road (IMPORTANT)
1. `main` is the live game. Never push directly to `main` without the owner's OK for that change.
   Work on a branch (e.g. `feature-name`), tell the owner how to test it, and merge only after they approve.
2. Before every commit run: `node tests/check.js && node tests/smoke.js && node tests/version.js`. All must pass.
3. If you change `manifest.webmanifest`, icons, or `sw.js` itself, bump `CACHE` (`bgw-v1` → `bgw-v2`) in `sw.js`.
4. Versions: `VERSION` (top of the game script in `index.html`) is `0.UPDATE.CHANGE`, e.g. `0.4.11`.
   - Raise CHANGE (last number) with EVERY commit that touches a game file (index.html, sw.js, manifest, icons).
     `tests/version.js` enforces this. The owner uses it to see whether their device has the newest build.
   - UPDATE = the release being built. After an update is merged to `main`, the next work starts at `0.(N+1).1`.
   - The start screen and pause menu show `v0.4.11`, plus "· test build" anywhere except the live Pages site.
   - Add a section to `CHANGELOG.md` per update (`v0.N`), and after merging tag it (`v0.N.C`). No GitHub
     Releases until the owner declares 1.0.
   Give the owner a test link: https://raw.githack.com/bgwgamesofficial/birds-gone-wild/BRANCH/index.html
5. Keep commits small and described in plain English.
6. Do not add new network dependencies casually. Three.js and its post-processing add-ons load from
   cdnjs/jsdelivr (see the `<script src>` tags); bloom falls back gracefully if they fail.

## Branches
- `main` – the live game.
- `hawk-test` – the working/test branch. Test link: https://raw.githack.com/bgwgamesofficial/birds-gone-wild/hawk-test/index.html
  When the owner approves, merge `hawk-test` into `main` via a pull request.
- `classic-modes` – holding branch: the full game with difficulty levels 1–5 as of v0.5.3. Do not delete.
  The owner may want levels 1–4 back later.

**GAME MODES (since v0.6.8):** `BR` = false -> "Infinite Run" (the original endless game: `aiHuntInf()`, the
`mode===5&&!BR` spawn block, coin-steal deaths, XP levels via `gainXp()`, `gameOverInf()`, 5 butterflies per life);
`BR` = true -> "Boss Run" (50 levels, hearts, bosses ... everything described under LEVELS/HEARTS below). Chosen on
the start card (`.gm` buttons, `setGame()`, saved in `flappygame`). Separate saves: Infinite uses the original keys
`flappyprog` {level,xp,perks}, `flappywallet`, `flappyfpv_m5`; Boss Run uses `flappyboss` {stage,xp,perks},
`flappywallet_boss`, `flappyfpv_boss`. Keep Infinite Run behaving exactly like before unless the owner asks
(a seeded side-by-side run against the v0.5.4 file matched frame-for-frame). Exception the owner asked for (v0.6.9):
the anti-camping fix (campT / spawnCloudHawk / aim straight at a camper) also runs in Infinite Run. Guard Boss-Run-only code with `BR`.

**Since v0.5.4 the game is level 5 only** (`let mode=5`, no difficulty picker). The code for modes 1–4
(pipes, `MODES[0..3]`, back camera) is still inside `index.html` but unreachable; don't spend effort on it.

## Run it locally
`python3 -m http.server 8000` in this folder, then open http://localhost:8000/ (the service worker needs http, not file://).

## Game design in brief
- Difficulty modes 1–5 live in the `MODES` array: `s` speed, `gap` pipe gap, `f` foe frequency, `m` reward
  multiplier (also scales prices, steal amounts, revive cost, XP), `mv` pipe movement, `dj` max gap-height jump,
  `ai` AI strength, `hb` hitbox adjustment. Best score is stored per mode.
- **Mode 5 is the "HAWK TEST" mode**: no pipes, side camera locked, hawks only, curving road, higher ceiling,
  hawk-themed shop and perk text (`HITEM` / `HPERK`). The owner wants to try ideas here first and roll them out
  to other modes only after approving them.
- Hawks cross the player's lane sideways (position `f.x`, independent of pipe speed). Height markers ("!") on
  the screen edge show where each hawk will cross. Hawk kinds (mode 5): hunter, feint, dash, sweeper, plus
  pincer pairs. Hawks learn the player's habitual height (`HAB` bins, `habitY()`).
  Since v0.6.3 `aiHunt5()` predicts with gravity, uses swoop offsets (`f.sw`), group cut-off (`f.cut`), and at the
  lock distance commits to a crossing height `f.ty` (shown by the "!" marker). Hawks with `f.wantRet` U-turn once
  after missing (`f.tt` turn timer, `f.ret` done); `f.pc`/`f.sc` stay set so they count and pay once.
  Since v0.6.5: independent minds (`f.mind` timer -> `f.act` hunt/high/low/feint/stall/burst, speed `f.sv`->`f.svT`),
  one late re-aim after lock (`f.reaimed`). 3-HAWK RULE: `hawksActive()` (boss always counts) must stay <= 3 -
  check it before ANY spawn, U-turn or escort. Anti-camping: `campT` (time above `CLO`) -> `spawnCloudHawk()`;
  hawks aim straight at a bird riding the clouds/ceiling. Smart butterflies on 'fly' levels in `aiFlee()`.
  `IS_TEST` (not the live host) only adds "· test build" to the version label (the level picker was removed in v0.6.10).
- Since v0.6.6: HEARTS. In mode 5 `foeHit()` steals coins and calls `die()`, which spends a heart (`LIFE_SEG` of
  `lifePts`) or ends the game. `levelHearts()` gives >= `START_HEARTS` (2; 3 on levels 1-3) at each level start.
  Hawk rule = 5 (`HAWK_MAX`), per-level limit `lvMaxActive()`. Difficulty table `LV_TAB` (levels 1,5,...,50);
  bosses use `bossD()` x `BOSS_K`=1.4, lineup `bossLineup()` (Chief / Captain `f.cap`). These numbers were tuned
  with a simulated player; change them in small steps.
- Mode 5 butterflies (`flies`, `spawnFly()`, `aiFlee()`): small, cross like hawks (speed `FLYV`) but steer away from
  the player's predicted height. Catching one adds `FLY_GAIN` (12.5 = 8 butterflies per heart) to `lifePts` (bar `#life`, 3 segments of `LIFE_SEG`).
  In `die()`, a full segment is spent to survive (like the shield). Reset clears lives.
- Player flight ceiling `CEIL` and cloud base `CLO` are set per mode in `setCeil()`: modes 1–4 `CEIL`=16, `CLO`=9.5
  (pipes still use `TOP`=11); mode 5 `CEIL`=20, `CLO`=16 with a thin cloud sheet. Touching the ceiling does not kill
  you. Modes 1–4: cloud banks white out the screen when the camera passes through them. Mode 5: the screen whites
  out when the bird itself is above `CLO` (the toucan is hidden in the clouds).
- Sky cycles: day/night from `tod`, plus a random NEON cycle (`neo` 0..1, `neonTick()`/`neonApply()`/`neonReset()`).
  Night extras live in `updNightSky()` (shader stars, moon texture/halo, shooting stars). The owner preferred a calm
  night: no aurora or Milky Way. Sun/moon/stars sit far away (`SKYZ`, `SKYK`) behind the mountains.
- Mountains: `mtns` (3 curved layers from `mkMountains()`, shader `MTN_FS`), coloured each frame in `updMountains()`.
- Neon extras: horizon glow (`skyU.hk`), road light strips (`roadEdges`), prop tint (`neonMats`), beat pulse
  (`neoPulse` from `beatPulse()`). Neon music: `neonStep()` inside `musTick()` (switches each bar when `neo>.5`).
- UI: top bar shows only Pause (+ camera in modes 1–4) while playing (`body[data-st]`, `body.m5`); sound, restart
  (tap twice) and settings are in the pause menu.
- Mode 5 road bend: a fixed winding shape scrolls toward the player (`kap()`, `buildBend()`, `bendOff()`,
  `RS` = distance travelled). Ground and path planes are subdivided and bent on the CPU each frame. Props are
  shifted with the same function. Never animate the bend over time (it makes the road sway).
- LEVELS (since v0.6.2): `level` = 1..50 (`LVL_MAX`), saved as `stage` in `flappyprog`. Short levels with a type
  from `lvType()`: 'dodge' (most), 'fly' (level%10==5, catch butterflies), 'boss' (level%10==0, the Hawk Chief =
  foe kind 'boss' from `spawnBoss()`, turns around at |x|>13 and comes back). Goal size `lvNeed()`, progress
  `lvProg` via `lvAdd()` (from `hawkPassed(f)` / `catchFly`). `levelComplete()` pays a coin bonus; every 5th
  level opens shop -> perk, otherwise straight to `countdown()`. `showBanner()` shows the goal. Difficulty
  `lvD()` 0..~0.95 in waves; it drives spawn rate, group size (max 3), kinds, `lvSpd()`, hunt, lock distance
  (>= ~0.9 s), hitbox, steal. Old XP levels are gone (`gainXp` no-op). Since v0.6.4 game over sends you back to
  level 1 but keeps coins/perks; reviving keeps the level; `restartGame()` wipes everything.
- Settings has a "Reset best score" button (`resetBest()`, tap twice) that removes all `flappyfpv*` keys.
- Economy: coins, passive income ($0.25 per 2 s x `MM()`), marketplace (`ITEMS`), permanent perks (`PERKS`),
  revive with rising cost, enemies steal coins (die if you cannot pay).
- Level-up flow: marketplace (Next only) → perk choice (select, then Complete) → 3-second countdown.
- Camera: back view or 45-degree side view (button / V key); mode 5 forces side view.

## Code gotchas
- `S` is the settings object. Do not reuse that name for anything else.
- Everything is inside one IIFE; functions rely on hoisting, but `const`/`let` are in the temporal dead zone
  until their line runs. Watch declaration order.
- Game speed is `sp()`, which includes mode speed, slow-mo and perks. Hawks use `HS()` instead.
- Frame loop is dt-based with a frame limiter (`capFps`) and adaptive resolution (`adaptK`).
- Saved data (localStorage keys): `flappyset`, `flappymode`, `flappycolor`, `flappyview`, `flappymute`,
  `flappywallet`, `flappyinv`, `flappyprog`, `flappyfpv` (+ `_m<mode>` best scores). Changing a key's format
  can break existing players' saves – keep it backward compatible.
- `tests/smoke.js` runs against a stubbed Three.js, so it catches script errors, not visual problems.

## Backlog (suggested, not started)
- Split `index.html` into separate CSS / JS / data files.
- Vendor Three.js into the repo so the game does not depend on CDNs.
- A beta repository/Pages site for phone testing before releasing to `main`.
- Possible store packaging later (Android via Trusted Web Activity, iOS via Capacitor).
