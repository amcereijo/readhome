## Context

See proposal.md → Why for motivation. Current state shaping this design:

- Next.js 16 App Router app behind Clerk auth (`proxy.ts`, the Next 16 middleware replacement). The proxy matcher already excludes `*.js` and lists `/manifest.json` as a public route, so `sw.js` is served anonymously with no auth redirect — no middleware changes needed.
- `public/manifest.json` (name, `start_url`, `display: standalone`, icons 72–512) is wired in `app/layout.tsx`, which also sets `appleWebApp` meta for iOS. The manifest piece of installability is done.
- The app has **no** service worker, no PWA dependency (`next-pwa`, `serwist`, Workbox), and no offline behavior today.
- Pages are user-specific and authenticated; HTML documents are dynamic and must never be served stale. Static assets under `/public` and `/_next/static` are immutable/fingerprinted and safe to cache.

## Goals / Non-Goals

**Goals:**
- Register an activating service worker with a `fetch` handler on every page, so mobile browsers (Chrome Android, Samsung Internet) pass installability checks.
- Zero risk of stale or cross-user content: navigations and API traffic always go to the network.
- Graceful degradation on browsers without service worker support.

**Non-Goals:**
- Offline shelf reading or full offline app shell (explicitly excluded in proposal).
- Precaching app data, background sync, push notifications.
- A bundled build pipeline for the worker (no Workbox/webpack step).

## Decisions

- **Hand-written `public/sw.js` instead of next-pwa/serwist.**
  The worker is ~40 lines and only needs `install`/`activate`/`fetch` handlers. Alternatives (next-pwa, serwist) add a build-time dependency and precaching machinery designed for offline apps we do not ship. Hand-written keeps the behavior auditable and the cache surface zero.

- **Fetch handler: network pass-through for everything, cache only same-origin immutable static assets.**
  - Non-GET requests, API routes, and Clerk proxy routes (`/__clerk`, `/api`) are not intercepted (`return` early, no `respondWith`), so auth cookies and CSRF-sensitive POSTs are untouched.
  - Navigations (`request.mode === "navigate"`): `respondWith(fetch(request))` — network-only, satisfying Chrome's fetch-handler requirement without caching HTML.
  - Static assets (`_next/static`, `/public` files with `Cache-Control: immutable`): cache-first with runtime fill. These are fingerprinted, so staleness is impossible; this also makes repeat loads faster.
  - Alternative considered: precache an app shell offline fallback. Rejected — an offline page requires caching a document response, which risks serving a signed-in user's HTML to a signed-out session, for a benefit nobody asked for.

- **Registration via a small client component mounted in `app/layout.tsx`.**
  The layout is a server component; registration needs `navigator.serviceWorker` and `window`, so a `"use client"` component (e.g. `ServiceWorkerRegister`) calls `navigator.serviceWorker.register("/sw.js")` in a `useEffect` once `window` loads. Failures are swallowed (console only) per the degradation spec. Mounted once at the root so every route triggers registration.

- **Register in production-like environments only (skip when `process.env.NODE_ENV !== "production"`).**
  Keeps dev/HMR free of a stale-cache footgun and avoids the worker interfering with the dev server. Verification uses `next build && next start` locally plus the deployed preview.

- **Versioned runtime cache name + cache cleanup on `activate`, no `skipWaiting()`.**
  A constant like `const CACHE = "readhome-static-v1"` lets `activate` delete other versions' caches. Skipping `skipWaiting()` means a new worker waits for existing tabs to close before taking over — slightly slower rollout, but never swaps the worker under an open authenticated page mid-session.

## Risks / Trade-offs

- Worker bugs could degrade all page loads (a bad `respondWith` breaks navigation) → Mitigation: handlers are thin pass-throughs; any unexpected error rethrows to default network behavior; verify with `next start` before shipping.
- Caching anything user-specific would leak data across sessions/users → Mitigation: only fingerprinted static assets are cacheable; navigations/API/Clerk routes are excluded by construction.
- iOS Safari ignores most of this (no `beforeinstallprompt`; "Add to Home Screen" is manual) → Accepted: iOS behaves exactly as today, using the existing `apple-touch-icon` and `appleWebApp` meta.
- New worker versions languish as "waiting" while old tabs stay open → Accepted trade-off of skipping `skipWaiting()`; users on fresh loads get the new worker.

## Migration Plan

Additive and reversible. Deploy the two new files plus the layout mount; verify in DevTools (Application → Service Workers shows activated; Manifest shows no errors) and on an Android device/emulator. Rollback = remove the registration mount; browsers will drop the worker on the next check once it 404s, with no user action required.
