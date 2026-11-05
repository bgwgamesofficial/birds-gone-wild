# Testing tools (for tuning and checking the game)

These are **not** run by GitHub's automatic tests. They are simulation tools Claude used to tune Boss Run's
difficulty and to prove Infinite Run still matches the original game. They run the real game code in Node with
a stubbed 3D library (like `tests/smoke.js`), so they are fast and need no browser.

Run them from the repository root. Slow ones take a few minutes.

| Tool | What it answers | Example |
|---|---|---|
| `par.sh` + `bot.js` | **Boss Run difficulty curve:** a human-like simulated player (reads the red "!" markers, reacts ~0.2 s late, aims with some error, never revives) plays from level 1 on one life. Prints the share of runs that cleared each level. | `tests/tools/par.sh index.html 5 0.5` (4 x 5 = 20 runs, ~2-4 min) |
| `bot.js` | Same simulated player, single process. Also prints hits per level on stderr. | `node tests/tools/bot.js index.html 6 0.5 1` |
| `botboss.js` | **How hard the bosses are:** boss hits per minute against the dodging simulated player on one boss level (the player cannot die here). Compare two versions of the game. | `node tests/tools/botboss.js index.html 8 0.5 30` |
| `twin.js` | **Did Infinite Run change?** Runs a game file with fixed random numbers and a scripted normal-height player for 20,000 frames and prints a trace. Two files that behave the same give identical traces. | see below |
| `campinf.js` | **Ceiling camping (Infinite Run):** how often a bird stuck at the ceiling gets hit per minute. | `node tests/tools/campinf.js index.html` |
| `sim.js` | Small checks: `camp` (Boss Run ceiling camper), `max3` (most hawks at once), `fly` (butterfly level length), `boss` (boss level length), `hits`, `bosshits`. | `node tests/tools/sim.js index.html max3` |

## Comparing against an older version

Get any older game file from git history, then run the same tool on both:

```bash
git show 1c7856f:index.html > /tmp/v054.html      # live game v0.5.4 (the original Infinite Run)
node tests/tools/twin.js /tmp/v054.html > /tmp/a.txt
node tests/tools/twin.js index.html > /tmp/b.txt
diff /tmp/a.txt /tmp/b.txt && echo "Infinite Run plays exactly like v0.5.4"
```

`twin.js` uses Infinite Run (the default mode). Since v0.6.11 every new game starts with $0 and the anti-camping
fix is active, so expect small differences against v0.5.4 from those two owner-requested changes.

Useful old versions: `1c7856f` = v0.5.4 (original endless game), `ccecebd` = v0.6.5 (bosses before the
"40% harder" change), `c19028f` = v0.6.11 (Boss Run + Infinite Run release).

## Difficulty targets used for Boss Run (v0.6.6)

Share of simulated average players (`skill 0.5`) that clear each level, starting at level 1 on one life:

| Level | Target | Measured (24 runs, v0.6.6) |
|---|---|---|
| 1-10 | almost everyone | 100% |
| 20 | about 65-85% | 83% |
| 30 | about 35-45% | 46% |
| 40 | about 12-17% | 17% |
| 45 | a few % | 8% |
| 50 | almost nobody | 0% |

Knobs: `LV_TAB` (difficulty per level), `BOSS_K` (boss strength, 1.4 = about 40% harder than v0.6.5), `START_HEARTS`,
`lvNeed()` (goal sizes), `lvMaxActive()` (hawks at once). Change one in small steps and re-run `par.sh`.
Simulated players are not real people: use the numbers to compare versions, and the owner's playtesting to judge feel.
