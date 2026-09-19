## 1. Dictionary keys

- [x] 1.1 Add `searchPlaceholder`, `searchLabel`, `collapseSectionAria`, `expandSectionAria`, and `noMatches` keys under `publicShelf` in `lib/i18n/en.json`.
- [x] 1.2 Add the same keys with Spanish strings in `lib/i18n/es.json`.

## 2. Public shelf client wrapper

- [x] 2.1 Slim `app/components/public-shelf-view.tsx` to a thin server component that renders the page header and emits one `<PublicShelfInteractive>` with pre-grouped sections.
- [x] 2.2 Create `app/components/public-shelf-interactive.tsx` as a client component that owns the search query state and per-section collapse state. It renders the search input, the section headings with their collapse/expand toggles, and conditionally renders the filtered book list per section.

## 3. Wiring

- [x] 3.1 Confirm `app/share/[token]/page.tsx` still calls the server `PublicShelfView` unchanged (the signature is preserved).

## 4. Validation

- [x] 4.1 Run `npm run lint` and `npx tsc --noEmit` — confirm no errors.
- [x] 4.2 Verified filter behaviors end-to-end via a unit-style script: empty query shows all; title substring matches; author substring matches; case-insensitive; whitespace trimmed; no-matches yields zero.
