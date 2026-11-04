# Birds Gone Wild – web app files

Upload everything in this folder (including the hidden `.nojekyll` file) to the root of a GitHub repository.

## Turn on GitHub Pages
1. In the repository: Settings → Pages.
2. Source: "Deploy from a branch". Branch: `main`, folder `/ (root)`. Save.
3. After a minute the game is live at https://YOUR-USERNAME.github.io/YOUR-REPO/

## Install on a phone
- iPhone (Safari): Share → Add to Home Screen.
- Android (Chrome): menu → Install app (or Add to Home screen).

## Updating
Replace `index.html` in the repository. Players get the new version the next time they open the game online.
To force every player to re-download everything, change `bgw-v1` in `sw.js` to `bgw-v2`.

## Offline
The game saves itself and the 3D library on the first visit, so it works offline afterwards.
