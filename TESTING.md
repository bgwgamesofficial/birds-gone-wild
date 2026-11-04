# How to test a change before it goes live

The live game is the `main` branch. Every change is made on a separate **branch** first,
so you can try it without players seeing it. Only after you say "OK" does it get merged into `main`.

## 1. Check the automatic tests (green tick)
Every time a change is pushed, GitHub runs two tests by itself (takes about a minute).
1. Open https://github.com/bgwgamesofficial/birds-gone-wild
2. Click the **Actions** tab at the top.
3. The newest run is at the top. Green tick = tests passed. Red cross = something is broken; don't merge it, tell Claude.

The tests only catch code errors. They cannot tell whether the game *looks* or *feels* right – that's your job in step 2.

## 2. Play the test version
Open this address (replace `BRANCH-NAME` with the branch name Claude gives you):

    https://raw.githack.com/bgwgamesofficial/birds-gone-wild/BRANCH-NAME/index.html

- Works on the desktop browser and on the Galaxy Z Fold (just open the link in Chrome).
- Look at the small version number under the Start / Settings buttons. It tells you which version you are playing.
- Try the thing that changed, then play a couple of normal rounds in a few difficulty modes.
- If you see an old version: wait a few minutes and reload (that site caches for a short time).

## 3. Approve and release
1. Tell Claude "approved" (or what to fix).
2. Claude opens a **pull request** (a request to merge the branch into `main`). On github.com:
   **Pull requests** tab → click it → check the green tick → **Merge pull request** → **Confirm merge**.
3. A minute or two later the live game updates: https://bgwgamesofficial.github.io/birds-gone-wild/
4. On your phone, close and reopen the game (twice if needed) and check the version number changed.

## When bumping the version
The game is not released yet, so versions count updates: 0.1, 0.2, 0.3 … 0.9, 0.10, 0.11 and so on
(0.10 comes after 0.9 – it means "update number ten", not "zero point one").
The number shown on the start screen is `VERSION` near the top of the script in `index.html`.
Each update to the live game gets the next number and a matching section in `CHANGELOG.md`.
When the game is ready for a real release, it becomes 1.0.
