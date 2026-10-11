// Read Home service worker.
//
// Purpose: satisfy mobile-browser installability (a registered worker with a
// fetch handler) and speed up repeat loads of immutable static assets. It is
// deliberately conservative: navigations, API routes, Clerk proxy traffic,
// and non-GET requests always go straight to the network, so no authenticated
// or user-private content is ever served from cache.
//
// Bump CACHE when the caching behavior of this worker changes; activation
// removes all caches from previous versions.

const CACHE = "readhome-static-v1";

// Next build output under /_next/static is content-hashed and immutable.
const IMMUTABLE_PREFIX = "/_next/static/";

// Size-suffixed public icons are content-stable by name: the same filename
// never serves different bytes.
const IMMUTABLE_PUBLIC =
  /^\/(?:favicon-\d+x\d+\.png|favicon\.ico|icon\.svg|apple-touch-icon\.png)$/;

self.addEventListener("install", () => {
  // Nothing to precache. Intentionally no skipWaiting(): an updated worker
  // activates only after open tabs close, never mid-session under an
  // authenticated page.
});

self.addEventListener("activate", (event) => {
  const dropStaleCaches = caches
    .keys()
    .then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE)
          .map((name) => caches.delete(name)),
      ),
    );
  event.waitUntil(dropStaleCaches);
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Never touch mutations, API routes, or the Clerk Frontend API proxy.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/__clerk")) {
    return;
  }

  // Documents are user-specific and dynamic: always network, never cached.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request));
    return;
  }

  // Fingerprinted/immutable static assets only: cache-first with runtime fill.
  if (
    url.pathname.startsWith(IMMUTABLE_PREFIX) ||
    IMMUTABLE_PUBLIC.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      }),
    );
  }
});
