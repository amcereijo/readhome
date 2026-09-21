## 1. Capture pipeline

- [x] 1.1 Add `@playwright/test` to `devDependencies` and run `npx playwright install chromium`.
- [x] 1.2 Create `scripts/capture-landing-screenshots.mjs` that boots `next dev`, opens a chromium page at a configured viewport, stubs `/api/books/search` and `/api/books/isbn` with deterministic fixture responses, and refuses to run if production env vars are present.
- [x] 1.3 Add the dev-only fixture bypass route `app/dev/landing-fixture/route.ts` gated on `process.env.LANDING_CAPTURE === "1"` and `process.env.NODE_ENV !== "production"`, signing in a fixed seeded `fixture@landing.local` user.
- [x] 1.4 Seed a fixture user with a small set of books (mixed statuses, friends, recommendations) via a new `scripts/seed-landing-fixture.mjs` that runs against the local SQLite dev database.
- [x] 1.5 Implement per-feature capture: navigate to each route (`/`, `/stats`, `/friends`, `/recommendations`, `/share/<token>`, `/u/<fixture-username>`, plus the add-book modal opened from `/` and the barcode scanner overlay at a mobile viewport), wait for fonts and images, and write a PNG to `public/landing/feature-<key>.png`.
- [x] 1.6 Implement add-book and barcode-scan animations: capture a sequence of timed screenshots through the modal/scanner flow, then encode them to GIFs with `sharp` (capped at 3 s, 8–12 fps, ≤ 2 MB; fall back to a single-frame PNG otherwise).
- [x] 1.7 Write `public/landing/manifest.json` with `{ feature, route, viewport, type, src, alt }` for every asset, and assert in the capture script that no orphan files exist outside the manifest and no manifest entries are missing on disk.
- [x] 1.8 Add `"landing.capture": "node scripts/capture-landing-screenshots.mjs"` to `package.json` scripts.

## 2. i18n content

- [x] 2.1 Add `landing.hero.*` keys (eyebrow, title, subtitle reinforcing search + barcode add paths, primary/secondary CTA labels) to `lib/i18n/en.json`.
- [x] 2.2 Add matching `landing.hero.*` translations to `lib/i18n/es.json`.
- [x] 2.3 Add `landing.features.<featureKey>.{headline, body}` entries to `lib/i18n/en.json` for: `add-book`, `barcode-scan`, `search`, `shelf`, `statuses`, `statistics`, `public-share`, `friends`, `friend-shelf`, `recommendations`, `goodreads-import`, `language`, `account`.
- [x] 2.4 Add matching Spanish translations for every `landing.features.*` entry to `lib/i18n/es.json`; verify parity with `node -e` over both files.

## 3. Component primitives

- [x] 3.1 Create `app/components/landing/landing-screenshot.tsx` implementing `<LandingScreenshot>` (branches on `type` between `<img>` and `<video>`, honors `prefers-reduced-motion` via a CSS class swap to the still PNG).
- [x] 3.2 Create `app/components/landing/landing-feature-section.tsx` implementing `<LandingFeatureSection>` (responsive stacked/two-column layout, configurable `imageSide`, copy-only fallback when no `src` is provided).
- [x] 3.3 Create `app/components/landing/landing-hero.tsx` implementing `<LandingHero>` (tagline pill, title, subtitle, primary/secondary `LinkButton`s, optional hero media on `md:` and above).
- [x] 3.4 Create `app/components/landing/index.tsx` exporting the new `<LandingPage>` that composes the hero plus one `<LandingFeatureSection>` per `landing.features.*` key, alternating `imageSide`, and reads asset paths from `public/landing/manifest.json` via a typed helper `lib/landing/assets.ts`.

## 4. Wiring

- [x] 4.1 Update `app/page.tsx` to import the new `<LandingPage>` from `@/app/components/landing` (no server-side changes).
- [x] 4.2 Add the TypeScript types and a small `lib/landing/assets.ts` helper that reads the manifest at build time and falls back to an empty record if `public/landing/manifest.json` is missing (so the page renders copy-only before the first capture run).
- [x] 4.3 Add a smoke check (test or script) that asserts every `landing.features.*` key in `en.json` exists in `es.json` and vice versa.

## 5. Verification

- [x] 5.1 Run `npm run landing.capture` locally and confirm `public/landing/` contains a PNG/GIF for every feature and a valid `manifest.json`.
- [x] 5.2 Run `npm run lint` and `npm run build` and fix any new errors.
- [x] 5.3 Sign out, open `/` in both EN and ES, verify every section renders with its image/animation, the hero copy mentions both add paths, and `prefers-reduced-motion: reduce` pauses/replaces animations.
- [x] 5.4 Sign in as a normal user and confirm the existing shelf UI is unaffected.
