// ════════════════════════════════════════════════════════════════
// Service worker — CTT PWA (non-Telegram customers)
// ----------------------------------------------------------------
// Strategy: network-first with an offline fallback to the cached app
// shell. Keeps content fresh online, still opens offline.
//
//   * Only handles same-origin GET requests.
//   * Cross-origin (the API on another host, remote images) is left to
//     the browser — never cached, never intercepted.
//   * Bump CACHE on any shell change so `activate` purges the old one.
// ════════════════════════════════════════════════════════════════
const CACHE = 'ctt-pwa-v4';
const SHELL = ['./', './index.html', './manifest.json', './icon.svg', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
        .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
        .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    const req = e.request;
    if (req.method !== 'GET') return; // never cache writes
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return; // API + remote images: browser handles
    // Never intercept media streaming — cloning/caching breaks <video> range requests (stays "loading").
    if (req.destination === 'video' || req.destination === 'audio') return;
    if (req.headers.has('range')) return;
    if (url.pathname.startsWith('/media/')) return;

    e.respondWith(
        fetch(req)
        .then((res) => {
            // Cache fresh same-origin shell assets for offline use.
            if (res && res.status === 200 && res.type === 'basic') {
                const copy = res.clone();
                caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
        })
        .catch(() =>
            caches.match(req).then((cached) =>
                cached
                // Navigations fall back to the cached app shell, then a plain offline notice.
                ||
                (req.mode === 'navigate' ? caches.match('./index.html') : undefined) ||
                new Response('Hors ligne — reconnecte-toi.', {
                    status: 503,
                    headers: {
                        'Content-Type': 'text/plain; charset=utf-8'
                    },
                })
            )
        )
    );
});

// Let the page trigger an immediate update when a new SW is waiting.
self.addEventListener('message', (e) => {
    if (e.data === 'SKIP_WAITING') self.skipWaiting();
});