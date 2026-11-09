const CACHE_NAME = "imro-admin-shell-v1";
const APP_SHELL = ["/manifest.webmanifest", "/icons/imro-icon.svg"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/rest/") || url.pathname.startsWith("/auth/") || url.pathname.startsWith("/functions/")) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => new Response(
      "<!doctype html><meta name='viewport' content='width=device-width'><title>IMRO ESPORTS</title><body style='background:#080d15;color:white;font:16px Arial;padding:24px'><h2>IMRO ESPORTS Admin</h2><p>You are offline. Reconnect to manage tournaments securely.</p><a style='color:#55e6a5' href='/admin.html'>Try again</a></body>",
      {headers:{"Content-Type":"text/html; charset=utf-8"}}
    )));
    return;
  }
  if (url.pathname === "/manifest.webmanifest" || url.pathname === "/icons/imro-icon.svg") {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
  }
});