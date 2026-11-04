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
- Look at the small version number under the Start button (or in the pause menu). It should match the number
  Claude gave you and say "test build".
- Try the thing that changed, then play a couple of normal rounds in a few difficulty modes.
- If you see an old version: wait a few minutes and reload (that site caches for a short time).

## 3. Approve and release
1. Tell Claude "approved" (or what to fix).
2. Claude opens a **pull request** (a request to merge the branch into `main`). On github.com:
   **Pull requests** tab → click it → check the green tick → **Merge pull request** → **Confirm merge**.
3. A minute or two later the live game updates: https://bgwgamesofficial.github.io/birds-gone-wild/
4. On your phone, close and reopen the game (twice if needed) and check the version number changed.

## When bumping the version
Version numbers have three parts, for example **v0.4.11**:
- **0** – the game is not released yet (it becomes 1.0 at the first real release).
- **4** – the update being built (the 4th update). It goes up by one each time an update goes live.
- **11** – the change number. It goes up by one with **every single change**, so you can always tell whether
  you have the newest build. After an update goes live, the next one starts again at .1 (v0.5.1, v0.5.2 …).

The number is shown on the start screen and in the pause menu. Test links also say **"· test build"**;
the live game does not. If the number on your screen is lower than the one Claude told you, you are looking
at an older copy: wait a few minutes and reload. GitHub also checks automatically that the number was raised.
