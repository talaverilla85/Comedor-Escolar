/* Basic offline shell. Menu data is bundled with the app, and updates are network-first. */
const CACHE = 'mi-bandeja-shell-v1';
const PRELOAD = ['/', '/icon.svg', '/manifest.webmanifest', '/images/water.webp', '/images/soup.webp', '/images/pasta.webp', '/images/fruit.webp', '/images/bread.webp'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRELOAD)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(names => Promise.all(names.filter(name => name !== CACHE).map(name => caches.delete(name)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
    }
    return response;
  }).catch(() => caches.match(event.request)));
});
