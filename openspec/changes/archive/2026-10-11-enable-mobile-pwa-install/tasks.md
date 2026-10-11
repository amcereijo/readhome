## 1. Service worker

- [x] 1.1 Create `public/sw.js` with `install`, `activate`, and `fetch` handlers, a versioned runtime cache constant (e.g. `readhome-static-v1`), and no `skipWaiting()` (per design decisions)
- [x] 1.2 In `activate`, delete all caches whose names do not match the current version constant
- [x] 1.3 In `fetch`, bypass (no `respondWith`) non-GET requests and any request whose path starts with `/api` or `/__clerk`
- [x] 1.4 In `fetch`, handle navigations (`request.mode === "navigate"`) as network-only pass-through (`event.respondWith(fetch(event.request))`), never cached
- [x] 1.5 In `fetch`, handle same-origin requests to `/_next/static` and known immutable `/public` assets as cache-first with runtime fill into the versioned cache (fingerprinted assets only)

## 2. Registration

- [x] 2.1 Create `app/components/service-worker-register.tsx` as a `"use client"` component that registers `/sw.js` in a `useEffect`, only when `process.env.NODE_ENV === "production"` and `navigator.serviceWorker` exists, swallowing failures to console
- [x] 2.2 Mount `<ServiceWorkerRegister />` once in `app/layout.tsx` (inside `<body>`, alongside existing providers)

## 3. Verification

- [x] 3.1 Run `npm run build` and serve with production start; in Chrome DevTools confirm Application → Service Workers shows the worker activated and Application → Manifest shows no errors
- [x] 3.2 In DevTools Network, confirm navigations, `/api/*`, and `/__clerk/*` requests are NOT served "from ServiceWorker" and remain fresh per their cache headers
- [x] 3.3 Sign out and confirm `manifest.json` and `sw.js` both return 200 without redirect (anonymous installability path)
- [x] 3.4 On Android (device or emulator), confirm Chrome offers install ("Add to Home screen" installs as an app) and the installed app launches in standalone mode
- [x] 3.5 Run project checks (`npm run lint`, typecheck) with no new failures
