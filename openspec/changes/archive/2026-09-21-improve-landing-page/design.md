## Context

The current public landing page (`app/components/landing-page.tsx`) renders only three static feature cards and a tagline/title/subtitle pair — no imagery, no animation, no mention of search, barcode scanning, statistics, public sharing, recommendations, or language switching, even though every one of those has shipped (see `openspec/specs/*/spec.md`). It also relies on three generic `landing.feature*` strings that compress the entire app into "Organize / Connect / Import". Capture tooling does not exist in the repo: there are no Playwright/Chromatic/Storybook deps, and `public/` contains only favicons.

The redesign needs to (1) generate the visual evidence of the app's features (PNG screenshots + a couple of short loops), and (2) introduce composable landing primitives so every feature is shown with its own screenshot/section. The page must remain a pure client of the i18n dictionaries so bilingual parity is preserved (the `internationalization` spec governs this).

## Goals / Non-Goals

**Goals:**
- A single capture pipeline that produces committed, deterministic PNG/GIF assets in `public/landing/` plus a JSON manifest.
- Three small primitives (`<LandingHero>`, `<LandingFeatureSection>`, `<LandingScreenshot>`) that compose the new landing page and respect `prefers-reduced-motion`.
- Visible copy that explicitly mentions the two fastest add paths (title search, barcode scan) and lists every user-facing feature.
- Zero new runtime dependencies in the app bundle; capture deps are dev-only.

**Non-Goals:**
- Recording real video of the running app (capture is screenshot-based; loops are derived from sequenced stills).
- A CMS, MDX, or any runtime content layer — copy stays in `lib/i18n/*.json`.
- A/B testing infrastructure, analytics, or marketing tags.
- Migrating to a new component library or styling framework.

## Decisions

### Capture stack: Playwright + sharp, dev-only
- Use `@playwright/test`'s chromium binary plus a small Node script (`scripts/capture-landing-screenshots.mjs`) for headless capture. Playwright is already an *optional* peer dependency of `next@16.3.1`, so `npm install` is the only install cost beyond the first-run `npx playwright install chromium`. `sharp` (already in deps for favicon generation) handles resizing and PNG→GIF encoding. No `framer-motion`, `motion`, or animation library is added at runtime.
- **Alternatives considered:** Puppeteer (smaller but less idiomatic with Next), Chromatic/Storybook (heavy and CI-priced), `node-html-to-image` (no live app capture). Playwright wins on reliability of `await page.goto`, viewport handling, and `page.locator(...).screenshot()` against the real running dev server.

### Capture environment: seeded fixture user
- A small dev-only bypass: a `LANDING_CAPTURE=1` env var read inside a `dev`-only route handler `app/dev/landing-fixture/route.ts` that signs in a fixed seeded user (`fixture@landing.local`) via Clerk's `auth().mockUserId` (or `clerkClient.users.getUser` shim) when the env is set, and 404s otherwise. This keeps auth fully enforced in prod and avoids capturing signed-out screens.
- **Alternatives considered:** Disabling Clerk middleware (breaks too much); per-test users created on demand (non-deterministic IDs); recording browser sessions with a real user (privacy, flakiness). The env-gated route is local-only and never reachable in a deployed build (`process.env.NODE_ENV !== 'production'`).

### Animation format: GIF only, no MP4/WebP
- GIFs work in `<img autoplay>`, are trivially diffable, are cheap to encode with `sharp`, and avoid the audio/autoplay complications of `<video>`. The landing page only needs two short loops (add-book, barcode-scan), so the file-size cost is acceptable.
- **Alternatives considered:** MP4 (`<video>` needs `playsInline` for iOS Safari; ffmpeg is heavier than `sharp` for GIF); animated WebP (better compression but inconsistent Safari support and harder to diff). GIF is the lowest-risk option.

### Asset layout
- `public/landing/<feature-key>.png` for stills, `public/landing/<feature-key>.gif` for loops, and `public/landing/manifest.json` listing every asset with `{ feature, route, viewport, type, src, alt }`. The manifest is the source of truth — the React component imports it at build time so adding a feature only requires adding the asset and the i18n key.

### Component primitives
- New files: `app/components/landing/landing-hero.tsx`, `app/components/landing/landing-feature-section.tsx`, `app/components/landing/landing-screenshot.tsx`, `app/components/landing/index.tsx` (the new `<LandingPage>` implementation that imports them).
- `<LandingScreenshot>` branches on `type`: `image`/`gif` → `<img>` (with `prefers-reduced-motion` honored via CSS keyframes that pause on `animation-play-state: paused`), `video` → `<video autoPlay muted loop playsInline>`. The reduced-motion fallback swaps the `src` to a sibling `.png` first-frame when the matching `.gif`/`.webp` is requested.
- `<LandingFeatureSection>` is a flex/grid layout that stacks image-above-copy on mobile and uses a two-column grid with configurable `imageSide` on `md:` and above.
- `<LandingHero>` keeps the existing `PageTitle`/`PageSubtitle`/`LinkButton` primitives from `app/components/ui.tsx` to stay consistent with the rest of the app.

### i18n layout
- Add `landing.hero.*` (eyebrow + title + subtitle + primary/secondary CTA copy reinforcing the speed of adding a book) and `landing.features.<featureKey>.{headline, body}` for each user-facing capability. Existing keys (`landing.tagline`, `landing.title`, `landing.subtitle`, `landing.featureOrganize*`, `landing.featureConnect*`, `landing.featureImport*`, `landing.getStarted`, `landing.signIn`) remain so any external link referencing them keeps working.

### Build-time wiring
- The new `<LandingPage>` component imports `public/landing/manifest.json` via a typed `import manifest from "@/public/landing/manifest.json"` (or via a small `lib/landing/assets.ts` constant in dev to avoid build errors before the first capture run). If the manifest is missing, sections render copy-only — captured images are a progressive enhancement, not a hard requirement.

## Risks / Trade-offs

- **Capture flakiness on live Google Books responses** → The seeded fixture pre-populates fixture books locally and the capture script stubs `/api/books/search` and `/api/books/isbn` responses via Playwright route interception, so screenshots are deterministic.
- **GIF file size** → Cap loop length at ~3 seconds at 8–12 fps; if a GIF exceeds 2 MB, fall back to the still PNG with a `prefers-reduced-motion` still frame.
- **First-time Playwright install** → Document `npx playwright install chromium` in the script's banner output and in the new `landing.capture` npm script's stderr so the failure is actionable.
- **Capture drift** → Add a smoke check in the capture script that asserts each declared feature has an asset and that every asset in `public/landing/` is listed in `manifest.json`; the script exits non-zero if they disagree.
- **Privacy** → Captured screenshots must never include real users. The capture script refuses to run when the env indicates a production-shaped environment (presence of `TURSO_PRODUCTION_URL` or `NEXT_PUBLIC_APP_URL` matching the deployed domain) and uses a fixed seeded user locally.
- **Bilingual drift** → `openspec validate` already enforces `en`/`es` parity for landing keys; we add a pre-commit-time `node -e` check that every key in `landing.features` exists in both files.

## Migration Plan

- Land the capture pipeline first behind `npm run landing.capture`. Run it locally, commit the resulting `public/landing/` files. The page still works without them (copy-only fallback) so the rollout order is safe.
- Land the component primitives and the new `<LandingPage>` implementation in the same PR as the i18n additions.
- Rollback: revert the new `<LandingPage>` to the existing one-liner import in `app/page.tsx` (the file is unchanged — only the imported component swaps). Capture assets remain in `public/landing/` harmlessly if not consumed.

## Open Questions

- Should the hero media be a hand-illustrated SVG of the seed shelf, or a screenshot of the shelf itself? The current decision is "screenshot of the shelf" for consistency, but an SVG could load faster and look sharper on hi-DPI displays. **Resolved by deferring**: ship the screenshot variant first; swap to SVG in a follow-up change if performance/perception feedback suggests it.
