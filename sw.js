/* Service Worker: cached beim ersten Besuch alle Dateien,
   danach läuft die App komplett offline (Cache-first). */
const CACHE = 'bennet-v6';
const ASSETS = [
  '.',
  'index.html',
  'manifest.json',
  'css/style.css',
  'fonts/fredoka-latin.woff2',
  'js/storage.js',
  'js/audio.js',
  'js/art.js',
  'js/main.js',
  'js/games/huehner.js',
  'js/games/dino.js',
  'js/games/einhorn.js',
  'js/games/garten.js',
  'js/games/kissen.js',
  'js/games/trampolin.js',
  'js/games/schaukel.js',
  'img/einhorn.png',
  'img/regenbogen.png',
  'img/zauberwiese.png',
  'img/prinzessin.png',
  'img/papa-grillt.png',
  'img/geburtstag.png',
  'img/zahlen-einhorn.png',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  // kein skipWaiting: die neue Version wartet, bis der Nutzer den
  // Update-Hinweis antippt (sonst würde die App mitten im Spiel neu laden)
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Stale-while-revalidate: sofort aus dem Cache antworten,
   im Hintergrund frische Version für den nächsten Start holen. */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cached => {
      const fresh = fetch(e.request).then(resp => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return resp;
      }).catch(() =>
        e.request.mode === 'navigate' ? caches.match('index.html') : undefined
      );
      return cached || fresh;
    })
  );
});
