## Why

The app cannot be installed from mobile browsers. While the web app manifest, icons, and anonymous manifest access are now in place, the app ships **no service worker**. Chrome on Android and Samsung Internet require a registered service worker with a `fetch` handler before they offer the "Install app" prompt, so mobile users currently have no way to add Read Home to their home screen.

## What Changes

- Add a minimal service worker (`public/sw.js`) with an `install`, `activate`, and `fetch` handler sufficient to meet mobile PWA installability criteria.
- Add a client-side service worker registration component, mounted from the root layout so the worker registers on every page.
- Keep the service worker deliberately conservative: network-first pass-through with no app-data precaching, so authenticated private pages are never served from cache.
- No new runtime dependencies (hand-written ~40-line worker, not next-pwa/serwist).

Assumption: the goal is the install prompt on mobile browsers, not full offline functionality. Offline reading of shelf data is explicitly out of scope for this change.

## Capabilities

### New Capabilities

- `pwa-installability`: Mobile browser install support — the app registers a service worker with a fetch handler on every page such that Chrome on Android and Samsung Internet recognize the app as installable, without caching authenticated or private content.

### Modified Capabilities

<!-- None: the existing manifest/icons behavior is unchanged; this change only adds the service worker gate mobile browsers require. -->

## Impact

- **New files**: `public/sw.js` (service worker), a registration client component under `app/components/`.
- **Modified code**: `app/layout.tsx` to mount the registration component.
- **No proxy/middleware changes needed**: the `proxy.ts` matcher already excludes `.js` files and `/manifest.json`, so `sw.js` is served anonymously and is unaffected by Clerk auth gating.
- **No dependency additions, no schema/API changes.**
- Verified manually via Chrome DevTools (Application → Service Workers / Manifest) and the Android install prompt.
