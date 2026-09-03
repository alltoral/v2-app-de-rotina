// Service Worker do "Meu Dia" — cacheia o app pra ele abrir mesmo sem internet.
// Estratégia: tenta a rede primeiro (pra sempre pegar a versão mais nova);
// se a rede falhar (offline), serve a última cópia salva no cache.

const CACHE_NAME = 'meudia-cache-v3';

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

// Hosts that must NEVER be intercepted: Firestore's realtime sync channel and
// Google's Calendar/OAuth endpoints. Wrapping these in the cache logic below
// breaks their streaming/live behavior — this is what stopped cross-device
// sync last time, so these are bypassed untouched, straight to the network.
const BYPASS_HOSTS = [
  'firestore.googleapis.com',
  'www.googleapis.com',
  'oauth2.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com'
];

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let hostname;
  try { hostname = new URL(req.url).hostname; } catch (err) { return; }
  if (BYPASS_HOSTS.includes(hostname)) return;

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
