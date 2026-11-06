// Birds Gone Wild service worker: lets the game load offline after the first visit.
// Bump CACHE when you want every player to re-download everything.
// SHELL must list every file index.html loads (tests/structure.js checks this).
const CACHE = 'bgw-v2';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './img/logo.jpg',
  './css/game.css',
  './js/core/config.js',
  './js/scene/renderer.js',
  './js/scene/textures.js',
  './js/scene/bird.js',
  './js/scene/sky.js',
  './js/scene/mountains.js',
  './js/scene/effects.js',
  './js/scene/scenery.js',
  './js/scene/road.js',
  './js/scene/neon.js',
  './js/scene/world.js',
  './js/game/butterflies.js',
  './js/game/hawks.js',
  './js/game/pipes.js',
  './js/game/state.js',
  './js/game/coins.js',
  './js/ui/hud.js',
  './js/audio/sound.js',
  './js/audio/music.js',
  './js/game/items.js',
  './js/ui/shop.js',
  './js/game/run.js',
  './js/game/progression.js',
  './js/game/levels.js',
  './js/ui/pause.js',
  './js/ui/settings.js',
  './js/ui/start.js',
  './js/game/controls.js',
  './js/game/loop.js',
  './js/main.js',
  './js/register-sw.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // The game's own files (page, scripts, styles, images): try the network first so updates reach players
    // right away, and fall back to the saved copy when offline.
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then((r) => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)),
        ),
    );
    return;
  }
  // Other sites (the 3D library and fonts from their CDNs): saved copy first, fetched once and kept.
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req)
          .then((res) => {
            if (res && (res.ok || res.type === 'opaque')) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => hit),
    ),
  );
});
