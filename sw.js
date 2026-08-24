// Service Worker do "Meu Dia" — cacheia o app pra ele abrir mesmo sem internet.
// Estratégia: tenta a rede primeiro (pra sempre pegar a versão mais nova);
// se a rede falhar (offline), serve a última cópia salva no cache.

const CACHE_NAME = 'meudia-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        const fresh = await fetch(req);
        if (fresh && (fresh.ok || fresh.type === 'opaque')) {
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch (err) {
        const cached = await cache.match(req);
        if (cached) return cached;
        throw err;
      }
    })
  );
});
