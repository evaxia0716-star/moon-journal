/* 月誌 Service Worker — 駐店店員：把 App 存一份在手機裡，沒網路也能開 */
const CACHE_NAME = 'moon-journal-v13';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './logo-header.png'
];

// 安裝：先把核心檔案存起來
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 啟用：清掉舊版本的快取（改版號 v1 → v2 時會自動換新）
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 攔截請求：快取優先，沒有才去網路抓（抓到順手存起來，例如字型）
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          if (res.ok && (e.request.url.startsWith(self.location.origin) || e.request.url.includes('fonts.g'))) {
            cache.put(e.request, copy);
          }
        });
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
