// Boot: builds everything and starts the frame loop. Loaded last.
// Part of Birds Gone Wild - see docs/ARCHITECTURE.md for how the files fit together.

initComposer();
applyAll();
reset();
showCard('Birds Gone Wild', introText());
requestAnimationFrame(loop);
