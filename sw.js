const CACHE_NAME = 'word-blurts-v3';
const ASSETS = [
    './',
    './index.html',
    './script.js',
    './manifest.json'
];

// Install Event
self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS).catch((err) => {
                console.warn('PWA Cache Warning: One or more assets failed to cache:', err);
            });
        })
    );
});

// Activate Event: Delete old caches (v1, v2) so iOS loads the fresh script.js!
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event: Network-first for HTML/JS so updates always go live immediately
self.addEventListener('fetch', (e) => {
    if (!e.request.url.startsWith('http')) return;

    e.respondWith(
        fetch(e.request)
            .then((networkResponse) => {
                const copy = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
                return networkResponse;
            })
            .catch(() => caches.match(e.request))
    );
});
