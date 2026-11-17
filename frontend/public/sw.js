const TILE_CACHE = 'resqnet-map-tiles-v1';
const TILE_HOST_PATTERN = /tile\.openstreetmap\.org/;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  if (!TILE_HOST_PATTERN.test(url)) return;

  event.respondWith(
    caches.open(TILE_CACHE).then(async (cache) => {
      const cached = await cache.match(event.request);

      const networkFetch = fetch(event.request, { mode: 'no-cors' })
        .then((response) => {
          cache.put(event.request, response.clone());
          return response;
        })
        .catch(() => null);

      return cached || (await networkFetch) || new Response('', { status: 504 });
    })
  );
});
