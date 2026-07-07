// Fura Handbók — offline cache (virkar þegar appið er hýst á netinu / https)
const CACHE = 'fura-handbok-v2';
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './supabase-config.js',
  './manifest.webmanifest',
  './icons/icon.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first: sækja alltaf nýjustu útgáfu þegar net er til staðar,
// en falla aftur á skyndiminni (ónettengt). Þannig fá allir uppfærslur strax.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const res = await fetch(req);
        if (res && res.status === 200 && res.type === 'basic') cache.put(req, res.clone());
        return res;
      } catch (err) {
        const cached = await cache.match(req);
        return cached || Response.error();
      }
    })
  );
});
