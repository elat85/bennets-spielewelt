/* Service Worker: cached beim ersten Besuch alle Dateien,
   danach läuft die App komplett offline (Cache-first). */
const CACHE = 'bennet-v11';
const ASSETS = [
  '.',
  'index.html',
  'manifest.json',
  'css/style.css',
  'fonts/fredoka-latin.woff2',
  'sounds/tap.ogg',
  'sounds/pop.ogg',
  'sounds/ding.ogg',
  'sounds/wrong.ogg',
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
  'img/scenes/hub.webp',
  'img/scenes/huehner.webp',
  'img/scenes/dino.webp',
  'img/scenes/garten.webp',
  'img/scenes/kissen.webp',
  'img/scenes/trampolin.webp',
  'img/scenes/schaukel.webp',
  'img/scenes/malbuch.webp',
  'img/chars/huhn-1.webp',
  'img/chars/huhn-2.webp',
  'img/chars/rex-1.webp',
  'img/chars/rex-2.webp',
  'img/chars/langhals-1.webp',
  'img/chars/langhals-2.webp',
  'img/chars/drache-1.webp',
  'img/chars/drache-2.webp',
  'img/chars/kind-1.webp',
  'img/chars/kind-2.webp',
  'img/chars/teddy.webp',
  'img/chars/hase.webp',
  'img/chars/schwein.webp',
  'img/chars/koala.webp',
  'img/stickers/einhorn.webp',
  'img/stickers/regenbogen.webp',
  'img/stickers/sonne.webp',
  'img/stickers/blume.webp',
  'img/stickers/schmetterling.webp',
  'img/stickers/ente.webp',
  'img/stickers/pilz.webp',
  'img/stickers/eis.webp',
  'img/stickers/rakete.webp',
  'img/stickers/auto.webp',
  'img/stickers/ball.webp',
  'img/stickers/krone.webp',
  'img/stickers/stern.webp',
  'img/stickers/torte.webp',
  'img/stickers/ballon.webp',
  'img/stickers/marienkaefer.webp',
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
