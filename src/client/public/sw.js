// App-shell caching: always try the network first (this app needs live data), and
// fall back to whatever's cached when offline. Never touches /api/ requests — those
// must always hit the real server or fail outright, not serve stale financial data.
const CACHE_NAME = "budget-beaver-shell-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Bill-reminder push notifications, sent by the daily cron job.
self.addEventListener("push", (event) => {
  let data = { title: "Budget Beaver", body: "You have a bill due tomorrow." };
  try {
    data = event.data.json();
  } catch {
    // fall back to the default above
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: `${self.registration.scope}icons/icon-192.png`,
      badge: `${self.registration.scope}icons/icon-192.png`,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(self.registration.scope));
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  if (request.url.includes("/api/")) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match(self.registration.scope))
      )
  );
});
