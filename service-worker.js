const CACHE = "ferhan-academy-v10";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./assets/fonts/Uthmani.woff2", "./assets/icons/icon-192.png", "./assets/icons/icon-512.png"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(response => {
    if (response.ok && (req.destination === "document" || req.url.includes("/data/"))) {
      const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(req, copy));
    }
    return response;
  }).catch(() => caches.match("./index.html"))));
});
