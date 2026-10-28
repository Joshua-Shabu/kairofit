// Offline support: serve the app shell from cache when there's no connection.
const CACHE = "grow-v15";
const SHELL = ["./", "index.html", "config.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // never cache Supabase or other sites
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});

// Push notifications (see supabase/functions/notify). Tapping one opens Grow on the right day/screen.
self.addEventListener("push", e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data && e.data.text() }; }
  self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(l => l.forEach(c => c.postMessage({ type: "grow-refresh" })));
  e.waitUntil(self.registration.showNotification(d.title || "Grow", {
    body: d.body || "", tag: d.tag, renotify: !!d.tag, icon: "icons/icon-192.png", badge: "icons/icon-192.png",
    data: { url: new URL(d.url || "./", self.registration.scope).href }
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    const c = list.find(w => w.url.startsWith(self.registration.scope));
    if (c) { c.postMessage({ type: "grow-open", url }); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
