# Architecture

Birds Gone Wild is a static web game: plain HTML, CSS and JavaScript, no build step. The browser loads
`index.html`, which loads Three.js r128 from a CDN and then the game scripts in a fixed order. GitHub Pages serves the
`main` branch as-is.

```
index.html            page markup (menus, HUD) + the list of scripts, in load order
css/game.css          all styles
img/logo.jpg          start-screen logo
js/                   the game (see the table below)
sw.js                 service worker: offline play (SHELL lists every file)
manifest.webmanifest  install info for phones (PWA), icons/ holds the app icons
tests/                automatic checks (run on every push) + tests/tools (simulation tools, run by hand)
docs/                 this file
```

## How the scripts share code

The game files are **classic scripts that share one global scope**, not ES modules. Every top-level `function`,
`const` and `let` in one file can be used by the files after it. This keeps the game a set of static files with no
build step. The cost is a few rules:

1. **Load order matters.** Top-level code (code outside functions) runs when its file loads, so it can only use
   things from **the same file or earlier files**. Code inside functions runs later and can use anything.
   `tests/structure.js` loads the game file by file and fails if this rule is broken. Fix it by moving the function
   to an earlier file. Never fix it by swallowing the error.
2. **Names are global.** Two files must not declare the same name. Pick specific names (`hawkSpeed`, not `speed2`).
   Duplicate `const`/`let` names stop the game loading. Duplicate functions are caught by `tests/structure.js`.
3. **One file, one topic.** Every file starts with a `//` comment saying what it is for.
4. **Settings object `S`** belongs to the settings code. Do not reuse the name.

A possible next step is to move to ES modules (`import`/`export`) with a single shared `state` object. That is a
large change. Do it one area at a time, keeping `tests/tools/twin.js` traces identical.

## Load order (index.html)

| # | File | What it holds |
|---|------|---------------|
| 1 | `js/core/config.js` | `VERSION`, `IS_TEST` (test-build label), saved settings `S` |
| 2 | `js/scene/renderer.js` | Three.js `scene`, `cam`, `renderer`, main lights |
| 3 | `js/scene/textures.js` | `mkTex()` canvas texture painter |
| 4 | `js/scene/bird.js` | toucan model (`bird`, `wings`), colours, shadow |
| 5 | `js/scene/sky.js` | day/night sky, sun, moon, stars, shooting stars (`updNightSky`) |
| 6 | `js/scene/mountains.js` | mountain layers (`mkMountains`, `updMountains`) |
| 7 | `js/scene/effects.js` | particles (`burst`), bird glow, "!" warning markers, fireflies |
| 8 | `js/scene/scenery.js` | roadside props (`props`, `mkProp`) |
| 9 | `js/scene/road.js` | ground, road, road bend (`kap`, `buildBend`, `bendOff`, `applyCurve`) |
| 10 | `js/scene/neon.js` | Neon sky cycle (`neonTick`, `neonApply`, `neonReset`) |
| 11 | `js/scene/world.js` | clouds, cloud banks, flight limits (`CEIL`, `CLO`, `BOT`), `pipes`/`foes` lists |
| 12 | `js/game/butterflies.js` | butterflies (`spawnFly`, `aiFlee`, `catchFly`), heart bar (`lifePts`) |
| 13 | `js/game/hawks.js` | hawks (`mkFoe`, `spawnFoe`, `aiHunt*`, `foeHit`) |
| 14 | `js/game/pipes.js` | classic modes 1-4 pipes (unreachable since v0.5.4) |
| 15 | `js/game/state.js` | game mode `BR`, run state (`state`, `wallet`, `level`...), saves, `MODES` |
| 16 | `js/game/coins.js` | pipe/coin materials, `mkCoin` |
| 17 | `js/ui/hud.js` | wallet display, `popText` |
| 18 | `js/audio/sound.js` | `tone`, `noise`, `sfx` |
| 19 | `js/audio/music.js` | procedural music (`musTick`, `neonStep`), sound button |
| 20 | `js/game/items.js` | `ITEMS`, Hawk-mode texts, item effects, game speed `sp()` |
| 21 | `js/ui/shop.js` | Marketplace + Wave Shop (`renderShop`, `wsFill`, `wsReroll`, `shopNext`) |
| 22 | `js/game/run.js` | `reset`, `die`, `restartGame`, `doRevive`, `gameOver` |
| 23 | `js/game/progression.js` | `PERKS`, XP, upgrade menu (`showLevelUp`, `renderLvl`) |
| 24 | `js/game/levels.js` | Boss Run levels (`lvType`, `lvD`, `LV_TAB`, `levelComplete`), hawk rule, bosses |
| 25 | `js/ui/pause.js` | pause menu, countdown helpers, camera toggle, keys P/Esc/V |
| 26 | `js/ui/settings.js` | settings menu, graphics (`applyAll`, `initComposer`) |
| 27 | `js/ui/start.js` | start card (`showCard`), Download App, `setGame`, `startGame`, `countdown` |
| 28 | `js/game/controls.js` | `flap`, keyboard/touch input, resize, menu fitting |
| 29 | `js/game/loop.js` | `loop(now)`: the frame loop |
| 30 | `js/main.js` | boot: `initComposer(); applyAll(); reset(); showCard(...); requestAnimationFrame(loop)` |
| 31 | `js/register-sw.js` | registers `sw.js` |

## How a frame works

`loop(now)` in `js/game/loop.js` runs every animation frame. It limits the frame rate (`capFps`), adapts the
resolution (`adaptK`), and then, while playing and not paused:
physics (`vy`, `GRAV`, `FLAP`), spawning (hawks, butterflies, cloud hawks against ceiling camping), hawk AI, hits
(`foeHit` -> `die`), level progress (`lvAdd` -> `levelComplete`), sky/Neon/mountains, camera, and rendering
(bloom via `composer` when enabled). Game time is `gt`. Game speed is `sp()`, and hawks use `HS()`.

## Game modes

- **Infinite Run** (`BR === false`): the original endless game. Keep it behaving exactly as before unless the owner
  asks. `tests/tools/twin.js` proves this frame by frame.
- **Boss Run** (`BR === true`): 50 levels with hearts and bosses. Guard Boss-Run-only code with `BR`.

Saves (localStorage) are listed in `CLAUDE.md`. Keep save formats backward compatible.

## Tests

| Command | What it checks |
|---|---|
| `node tests/check.js` | every script parses |
| `node tests/structure.js` | files exist, are listed in `sw.js`, no duplicate functions, safe load order |
| `node tests/smoke.js` | runs the game headless (stubbed Three.js) for 4,000 frames plus game-rule checks |
| `node tests/version.js` | `VERSION` was raised when game files changed |
| `npx prettier --check .` | code formatting |

`npm test` runs the first four. `tests/lib/game.js` loads the game into Node for the tests and the simulation tools.
It reads both this layout and the old single-file `index.html`, so tools can compare against any older version.
