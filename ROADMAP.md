# Roadmap – Boss Run "survive, then shop" update (v0.8)

Ideas borrowed from the arena-survival genre (short waves, shop between waves, auto-firing weapons), made our own
with the toucan and the hawks. **Boss Run only** – Infinite Run stays the original game.

Each step has a name. Use the name when reporting a problem (for example: "Wave Shop: the lock button is too small
on the Fold"). Each step is tested on `hawk-test` before the next one starts.

Every step must work on **PC (mouse + keyboard)**, **phones (touch, portrait and landscape, Galaxy Z Fold folded
and open)**, and must be ready for the **Google Play Store** (see the last section).

| Step | Name | What it adds | Status |
|------|------|--------------|--------|
| 1 | **Wave Shop** | Shop after every level: 3 random offers, Reroll (price rises), Lock an offer for the next shop | In testing (v0.8.1) |
| 2 | **Auto-Weapons** | The toucan carries up to 4 weapons that fire on their own; hawks get health; merge two of the same weapon | Not started |
| 3 | **Bird Characters** | Pick a bird before a run; each has its own rules (e.g. double coins but 1 heart) | Not started |
| – | **Play Store Prep** | Runs alongside the steps (see below) | Not started |

## Step 1 – Wave Shop (v0.8.1)
- After every Boss Run level the Marketplace opens with 3 random items (no repeats).
- 🎲 **Reroll** swaps the offers you have not locked. It costs $4, then $8, $12… and goes back to $4 in the next shop.
- 🔓/🔒 **Lock** keeps an offer for the next shop (also through rerolls). Buying an offer marks it "Sold".
- The upgrade choice still comes every 5th level (shop first, then upgrade, then countdown).
- PC keys in the shop: **1 / 2 / 3** buy, **R** reroll, **Enter** next. Phones just tap (key hints are hidden on
  touch screens).
- Known limit: there are only 5 items, so rerolls repeat quickly. Step 2 adds weapons to the shop.

## Step 2 – Auto-Weapons (plan)
- Weapons bought in the Wave Shop, up to 4 at once, fire automatically at the nearest hawk – no extra buttons, so it
  plays the same with a mouse, a keyboard or one thumb.
- Ideas: Seed Shot (fast, weak), Feather Spread (short, hits several), Egg Bomb (slow, splash), Beak Dash.
- Two of the same weapon merge into a stronger one.
- Hawks get health; a level counts hawks dodged **or** defeated.
- The difficulty must be re-tuned with the simulated player (tests/tools) so level 1 stays easy and level 50 stays
  almost unbeatable.
- Watch phone speed: limit how many shots are on screen at once.

## Step 3 – Bird Characters (plan)
- Choose a bird on the start card. Each has a strength and a weakness (examples: Parrot – double coins, 1 heart;
  Owl – no weapons, but dodging stuns hawks).

## Play Store Prep (runs alongside)
The game is already an installable web app (PWA). The usual way to put a PWA on Google Play is a
**Trusted Web Activity** (an Android app that opens the live site full screen, without browser bars).
1. **Works offline, no CDN** – copy Three.js into the repo so the game does not depend on other websites
   (Play reviewers and players without signal).
2. **Phone polish** – no scrolling menus, big touch buttons (44 px or more), handle the Back button
   (Back = pause / close menu), keep the screen awake while playing.
3. **App files** – 512 px icon, feature graphic, screenshots, short and long description, privacy policy page
   (the game stores only local settings and progress, no accounts, no ads).
4. **Build the Android app** – with Bubblewrap or PWABuilder (free tools) on a computer; this needs the owner's
   Google Play developer account (one-time fee) and an `assetlinks.json` file in the site so the app can open
   full screen.
5. **Internal testing track** on Play first, then closed testing, then release.
