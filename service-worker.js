const CACHE_NAME = "mabidilala-portal-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./portal.html",
  "./contact.html",
  "./styles.css",
  "./script.js",
  "./assets/mabidilala-logo-mark.png",
  "./assets/mabidilala-logo-full.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./portal.html")))
  );
});
