## Context

See `proposal.md` for motivation and `specs/public-shelf-share/spec.md` for the behavior contract.

The header `Share` button we shipped two changes ago currently scrolls to a full-width inline `<ShareShelfPanel>` card on the owner&apos;s shelf page. That card owns the URL display, copy button, rotate, disable, and create controls. We are replacing the inline card with a popover anchored to the header button, so the button becomes the only entry point. The popover will host the same controls and reuse the existing server actions in `app/actions/sharing.ts`. The trigger button also needs a small on/off indicator tied to `public_shelf_enabled`.

Existing patterns to mirror: `app/components/add-to-shelf-button.tsx` and `app/components/recommend-panel.tsx` are both client-side modals anchored to a trigger button, with backdrop-click and `Escape` dismissal via a `useEffect` keyboard handler. We will mirror that shape.

## Goals / Non-Goals

**Goals:**
- Remove the inline `<ShareShelfPanel>` card from `app/page.tsx`.
- Replace the `<LinkButton>` trigger with a `<button>` that opens a popover anchored to itself.
- Popover reuses the existing mint / rotate / disable controls from `<ShareShelfPanel>` (which becomes its body) and the existing server actions.
- Popover closes on outside click and on `Escape`, matching the existing modal pattern.
- Header trigger shows a small teal dot indicator when sharing is enabled, none when disabled.
- Indicator&apos;s accessible label is localized.

**Non-Goals:**
- Anchoring math (positioning libraries) — popover is a simple centered/anchored modal overlay, not a floating dropdown that follows the trigger on scroll. Out of scope.
- Animations / transitions — popover appears and disappears without motion.
- Persisting popover open/close state across navigations — it&apos;s per page view.
- Keyboard navigation between popover controls beyond the default tab order — standard browser behavior is enough.
- Touch-specific long-press or hover affordances — not relevant for an on-click trigger.

## Decisions

### 1. Reuse `<ShareShelfPanel>` as the popover body

`<ShareShelfPanel>` is already a client component that owns URL state, copy state, and loading per action. We move it from being rendered inline on the page to being rendered inside the popover. Its props (`enabled`, `token`, `dictionary`) are unchanged. The component itself does not need to know it&apos;s inside a popover.

The header trigger and the open/close state live in a new parent: `app/components/share-shelf-popover.tsx`. That component owns `useState(open)`, renders the trigger button (which carries the indicator dot when `enabled`), and renders the popover overlay only when `open === true`.

**Alternative considered:** Make `ShareShelfPanel` aware of the popover context and lift state up. Rejected: leaves the panel reusable for any future surface (e.g. a settings page) without entangling it with modal concerns.

### 2. Trigger is a `<button>` with on-state indicator, not a link

Replacing the existing `<LinkButton href="#share-shelf">` with a `<button type="button">` is the right semantic change: opening a popover is an in-page action, not navigation. The button visual style matches the existing `<LinkButton variant="secondary">` (white background, ring-1 border) so the header layout is unchanged.

The indicator is a small (8 px) teal dot rendered inside the button, to the right of the `Share` label. It is rendered only when `enabled === true`. Decorative — its accessible label is conveyed via `aria-label` on the button (`share.buttonLabel + " — " + share.buttonLabelActive` when on, plain `share.buttonLabel` when off) so screen readers don&apos;t announce a stray &quot;•&quot;.

**Alternative considered:** Custom Tailwind-styled tooltip / dot placement. Rejected: native `title` already covers the tooltip; a positioned span with `aria-hidden` is the standard approach for purely decorative indicators.

### 3. Popover is a centered overlay, not an anchored popper

The popover is a centered modal with a translucent backdrop, identical in structure to `<AddToShelfButton>` and `<RecommendPanel>`. Anchoring math (position relative to trigger, follow-on-scroll) is intentionally out of scope. The centered overlay is a proven pattern in this app and is the simplest implementation that satisfies the spec&apos;s "popover anchored to the control" requirement.

**Alternative considered:** Anchored popper with absolute positioning relative to the trigger. Rejected: requires measuring the trigger and managing viewport edge cases, none of which are justified for a single one-off modal in this app.

### 4. Dismissal: outside click + `Escape` + trigger click

The popover closes on:
- Click on the backdrop (matches `AddToShelfButton`).
- `Escape` keypress while the popover is open (matches `AddToShelfButton` / `RecommendPanel`).
- A second click on the trigger (toggle behavior, matches typical popover UX).

State is local `useState<boolean>` inside the popover component. `useEffect` registers and cleans up the `keydown` listener.

### 5. Indicator key under existing `share` block

Add `share.indicatorLabel` (English: &quot;Sharing is on&quot;, Spanish: &quot;Compartir está activo&quot;) under the existing `share` block. The button&apos;s `aria-label` becomes `${share.buttonLabel} — ${share.indicatorLabel}` when `enabled` is true, and just `share.buttonLabel` when false.

### 6. Delete the old inline wrapper, not the panel component itself

`<ShareShelfPanel>` continues to exist as the popover&apos;s body — only the `<div id="share-shelf">` wrapper in `app/page.tsx` and the inline rendering go away. The `share-shelf` anchor id is removed from the page since nothing references it anymore. `app/page.tsx` mounts `<ShareShelfPopover>` in its place.

## Risks / Trade-offs

- **Centered overlay instead of anchored popper** → covers the trigger visually; on small screens with many books behind it, the user might lose track of where the trigger is. Mitigation: the header sticks to the top, the popover backdrop darkens the rest of the page, and closing it returns focus to the trigger.
- **No motion** → the popover appears/disappears instantly. Matches existing modals in the app; matches the project&apos;s quiet visual style.
- **Indicator dot is purely visual** → a sighted-only cue. Mitigation: the `aria-label` mentions "Sharing is on" when the dot is present.
- **Removing the inline card means losing the at-a-glance URL preview on the shelf page** → that preview now requires one click. Mitigation: the header button&apos;s indicator + tooltip give owners a hint that sharing is on; the full URL is one click away.
- **Reusing the panel as-is** → if the panel ever needs to render differently inside a popover vs. inline, we&apos;ll have to refactor it. Not blocking; no such need today.

## Migration Plan

1. Add `share.indicatorLabel` to both dictionaries.
2. Create `app/components/share-shelf-popover.tsx` containing the trigger button + popover overlay + indicator logic.
3. Update `app/page.tsx`: drop the `<div id="share-shelf">` wrapper and `<ShareShelfPanel>` import; import and render `<ShareShelfPopover>` in its place, passing `enabled`, `token`, and `dictionary`.
4. Verify: lint + typecheck, then visual inspection.

Rollback: revert the four-file diff. No DB or schema changes.

## Open Questions

None.
