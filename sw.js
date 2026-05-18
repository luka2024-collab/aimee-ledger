const CACHE_NAME = "aimee-ledger-pwa-v14";

const APP_FILES = [
  "/aimee-ledger/",
  "/aimee-ledger/index.html",
  "/aimee-ledger/styles.css",
  "/aimee-ledger/app.js",
  "/aimee-ledger/aimee-gu.jpg",
  "/aimee-ledger/wang.jpeg.jpeg",
  "/aimee-ledger/reference-bg.png",
  "/aimee-ledger/manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
