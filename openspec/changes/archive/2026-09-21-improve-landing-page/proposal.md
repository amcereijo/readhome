## Why

The current public landing page lists only three generic features (Organize, Connect, Import) and shows no visuals, so it under-represents the breadth of what the app now does and how easy adding a book is. We want a redesigned landing page that highlights the now-mature feature set — title search, barcode scanning, Goodreads import, statistics, public shelf sharing, recommendations, friend invites, and bilingual EN/ES — with real screenshots/animations of the running app, and copy that reinforces how fast it is to add a book.

## What Changes

- Redesign the public landing page (`app/components/landing-page.tsx`) into a richer, scrollable layout that presents every user-facing capability as a labeled visual + headline + short benefit.
- Add a generated image/asset pipeline (`scripts/capture-landing-screenshots.mjs` or equivalent) that boots the app against a seeded fixture user and captures viewport-sized PNG snapshots of each major screen (shelf, add-book modal with search results, barcode scanner overlay, stats, public shelf, recommendations, friends), plus animated GIF/MP4 derived from them, written into `public/landing/`.
- Add a small `<LandingScreenshot>` component (CSS-only animated fallback when motion is disabled) and an `<LandingFeatureSection>` layout primitive; replace the existing three `FeatureCard` cards with a per-feature section built from these primitives.
- Add new landing i18n strings under `landing.features.*` and `landing.hero.*` in both `lib/i18n/en.json` and `lib/i18n/es.json` (ES parity is required by the `internationalization` spec); keep the existing `landing.tagline`/`title`/`subtitle`/`getStarted`/`signIn` keys for backward compatibility with any external link that already references them.
- Add a `landing.capture` npm script in `package.json` so the screenshot/animation step is reproducible in CI and on developer machines.
- No new public surface, no new API routes, no schema changes.

## Capabilities

### New Capabilities

- `landing-assets`: Asset generation pipeline that produces the screenshots and animations referenced by the landing page, including a seeded fixture used solely for capture and a manifest mapping asset path → feature label.
- `landing-feature-sections`: Composable layout/component primitives (`LandingHero`, `LandingFeatureSection`, `LandingScreenshot`) used to render the redesigned landing page.

### Modified Capabilities

- `landing-page`: The page's content and structure change from a three-card overview to a per-feature scroll with screenshots/animations; the existing requirements (public entry, no personal data) remain and gain a requirement that every user-facing feature in the app is represented.
- `internationalization`: Landing-page strings gain a new `features` and `hero` namespace that must be translated into both `en` and `es`; this is a content addition, not a behavior change.

## Impact

- `app/components/landing-page.tsx` (rewritten) and a new sibling component file(s) under `app/components/landing/`.
- `app/page.tsx` continues to render `<LandingPage />` when signed out — no server logic change.
- `lib/i18n/en.json` and `lib/i18n/es.json` gain landing keys.
- `scripts/` gains a capture script; `package.json` gains a `landing.capture` script.
- `public/landing/` is a new directory holding generated PNG/GIF/MP4 assets; ignored from version control's runtime concerns but committed so the deployed page always has images.
- No dependencies are added if we use Playwright (already a transitive optional peer of Next). If Playwright is not already installed, the capture script will require `npx playwright install chromium` as a one-time setup step documented in the script's README output.
