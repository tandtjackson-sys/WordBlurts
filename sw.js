const CACHE_NAME = 'word-blurts-v1';
const ASSETS = [
    './',
    './index.html',
    './script.js',
    './manifest.json'
];

// Install Event
self.addEventListener('install', (e) => {
    self.skipWaiting(); // Force active status immediately
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS).catch((err) => {
                console.warn('PWA Cache Warning: One or more assets failed to cache:', err);
            });
        })
    );
});

// Activate Event
self.addEventListener('activate', (e) => {
    e.waitUntil(self.clients.claim());
});

// Fetch Event
self.addEventListener('fetch', (e) => {
    // Only handle HTTP/HTTPS requests (ignores chrome-extension:// or ads)
    if (!e.request.url.startsWith('http')) return;

    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(e.request).catch(() => {
                // Optional fallback if offline
            });
        })
    );
});
