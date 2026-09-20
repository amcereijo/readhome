## 1. Dictionary keys

- [x] 1.1 Add `share.indicatorLabel` to `lib/i18n/en.json`.
- [x] 1.2 Add `share.indicatorLabel` (`Compartir está activo`) to `lib/i18n/es.json`.

## 2. Components

- [x] 2.1 Create `app/components/share-shelf-popover.tsx`. Client component owning open state. Renders a `<button>` trigger (with the on-state indicator dot when enabled) and a centered popover overlay containing the existing `<ShareShelfPanel>` body. Closes on backdrop click, `Escape`, and trigger toggle.

## 3. Wiring

- [x] 3.1 Update `app/page.tsx`: remove the inline `<div id="share-shelf">` wrapper and the `<ShareShelfPanel>` import; mount `<ShareShelfPopover>` in its place.

## 4. Validation

- [x] 4.1 Run `npm run lint` and `npx tsc --noEmit` — confirm no errors.
- [x] 4.2 Visual inspection: the inline card is gone; the header now exposes a single `Share` button instead of three actions; dictionary keys resolve to expected English and Spanish strings.
