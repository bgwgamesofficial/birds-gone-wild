# Contributing to Birds Gone Wild

Thanks for helping. Start with [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) to see how the game is put together.

## Setup

You need [Node.js](https://nodejs.org) 20+ (for tests and formatting) and Python 3 (or any static file server).

```bash
npm install          # installs the code formatter (Prettier)
npm start            # serves the game at http://localhost:8000/
```

Open http://localhost:8000/ in a browser. Use http, not `file://`, because the service worker needs it.

## Before every commit

```bash
npm run format       # formats all code the same way
npm test             # syntax, structure, smoke test, version number
```

GitHub runs the same checks (plus `prettier --check`) on every push and pull request.

## Rules

1. **`main` is the live game.** Work on a branch, then open a pull request into `hawk-test` (the test branch). The
   owner plays it there and decides what goes live.
2. **Raise the version with every change to a game file.** `VERSION` in `js/core/config.js` is `0.UPDATE.CHANGE`.
   Raise the last number (`0.8.2` -> `0.8.3`). `tests/version.js` enforces this.
3. **Adding a script file:** add it to `index.html` (in the right place in the load order) and to `SHELL` in
   `sw.js`, then bump `CACHE` in `sw.js`. Start the file with a `//` comment saying what it is for.
   `tests/structure.js` checks all of this.
4. **Changing `sw.js`, `manifest.webmanifest` or icons:** bump `CACHE` in `sw.js` (`bgw-v2` -> `bgw-v3`).
5. **Infinite Run stays the original game.** Put Boss-Run-only changes behind `BR`. To prove Infinite Run did not
   change, compare `node tests/tools/twin.js` traces before and after (see `tests/tools/README.md`).
6. **Difficulty numbers** were tuned with a simulated player (`tests/tools/`). Change them in small steps and re-run
   the tools.
7. **Every menu must fit the screen without scrolling**, on PC and phones (including the Galaxy Z Fold, folded and
   open). Touch targets should be at least 44 px.
8. **No new network dependencies** without discussing it first.
9. Keep commits small, with plain-English messages. Add a line to `CHANGELOG.md` for player-visible changes.

## Code style

- Prettier decides formatting (`.prettierrc.json`: 120 columns, single quotes).
- One topic per file, in the folder that fits: `js/scene` (3D world), `js/game` (rules and logic), `js/ui` (menus
  and HUD), `js/audio`, `js/core`.
- Use descriptive names for new code. Many older names are short (`gt`, `sp`, `lvD`), so check the comment next to
  their declaration or `CLAUDE.md` when in doubt.
- Comment the *why* (game-design reasons, tuned numbers), not the obvious.
