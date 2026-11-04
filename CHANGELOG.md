# Changelog

Versions are `0.UPDATE.CHANGE` (e.g. v0.4.11). The last number goes up with every single change;
the middle number goes up each time an update goes live. Each section below is one update.

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
