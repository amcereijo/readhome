## 1. Components

- [x] 1.1 Extend `LinkButton` in `app/components/ui.tsx` to accept and forward `title` and `aria-label` props to the underlying `Link` element.

## 2. Dictionary keys

- [x] 2.1 Add `share.buttonLabel` and `share.buttonTooltip` to `lib/i18n/en.json`.
- [x] 2.2 Add the same keys with Spanish strings to `lib/i18n/es.json`.

## 3. Wiring

- [x] 3.1 Add `id="share-shelf"` to the wrapper around `<ShareShelfPanel>` in `app/page.tsx`.
- [x] 3.2 Add a `Share` `<LinkButton>` between `Import` and `Add book` in `app/page.tsx`, using `href="#share-shelf"`, `variant="secondary"`, the new button label, and the new tooltip.

## 4. Validation

- [x] 4.1 Run `npm run lint` and `npx tsc --noEmit` — confirm no errors.
- [x] 4.2 Visual inspection: `Share` button renders between `Import` and `Add book`; the panel wrapper carries the matching `id`; dictionary keys resolve to expected English and Spanish strings.
