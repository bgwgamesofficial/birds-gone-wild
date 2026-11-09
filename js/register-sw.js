// Registers the service worker (sw.js) so the game works offline after the first visit.
if ('serviceWorker' in navigator)
  addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
