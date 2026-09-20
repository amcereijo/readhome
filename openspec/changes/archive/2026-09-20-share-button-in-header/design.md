## Context

See `proposal.md` for motivation and `specs/public-shelf-share/spec.md` for the behavior contract.

The owner&apos;s home shelf page (`app/page.tsx`) already renders a full-width `<ShareShelfPanel>` card directly under the header. The header itself has two action buttons — `Import` (secondary) and `Add book` (primary) — implemented as `<LinkButton>` instances. The page already passes `dictionary` down to every component, so localization is straightforward. The panel is wrapped in a `<div className="mb-6">` with no anchor target today.

The smallest viable change is a third header button whose `href` is a fragment that scrolls to the panel, and an `id` on the panel&apos;s wrapper so the fragment resolves.

## Goals / Non-Goals

**Goals:**
- Add a third header action (`Share`) rendered between `Import` and `Add book`.
- The button&apos;s `href` is a fragment that scrolls the page to the existing inline share panel.
- The button uses a native browser tooltip via the HTML `title` attribute to explain its purpose.
- Localize the button label and the tooltip in both dictionaries.

**Non-Goals:**
- A popover, modal, or dedicated route for sharing settings — the inline panel already exists and works.
- Duplicating any panel controls in the header.
- Focus management beyond default browser scroll behavior.
- Animating the scroll — the existing CSS `scroll-behavior` (or lack thereof) on `html` is unchanged.

## Decisions

### 1. Anchor scroll instead of popover

The header button is a `<LinkButton>` whose `href` resolves to a fragment that scrolls to the inline `<ShareShelfPanel>`. The simplest expression of this in Next.js is `href="#share-shelf"` on the button and `id="share-shelf"` on the panel wrapper.

**Alternative considered:** A popover triggered from the header button. Rejected: duplicates the panel&apos;s chrome and state for marginal gain, and the inline panel already lives one scroll down.

**Alternative considered:** A dedicated `/share` settings page. Rejected: heavyweight for a control that is one scroll away.

### 2. Native `title` attribute for the tooltip

Use the HTML `title` attribute. `<LinkButton>` does not currently forward `title`, so we extend it (or wrap it) to accept and pass through the attribute. Browsers render the title in a small native popover on hover and after a focus delay; this is consistent with how every other action button in the app surfaces a tooltip (e.g., `<IconButton title={...}>` in the book list rows).

**Alternative considered:** A custom Tailwind-styled tooltip on hover/focus. Rejected for v1: adds new client state and accessibility surface for a single affordance, and breaks consistency with the rest of the app&apos;s icon-only buttons which use native `title`.

### 3. Extend `LinkButton` to forward `title` and `aria-label`

`LinkButton` currently accepts only `href`, `children`, `variant`, and `className`. Add `title?: string` and `aria-label?: string` as opt-in props. Both forward to the underlying `next/link` element. This is the smallest change that respects the existing API and unlocks the tooltip.

**Alternative considered:** Wrap the existing `<LinkButton>` in a `<span title="…">`. Rejected: spans do not reliably receive the title tooltip on all browsers when the inner element is interactive, and the wrapping element would interfere with the existing flex layout of the button group.

### 4. Button order: Import · Share · Add book

Place `Share` between `Import` (secondary) and `Add book` (primary). `Share` uses the `secondary` variant so the visual hierarchy stays: primary action (add a book) is rightmost, secondary actions are to its left.

**Alternative considered:** Place `Share` to the left of `Import`. Rejected: `Import` is a one-time setup action, `Share` is an ongoing affordance; grouping Import with Add book (the two data-entry actions) keeps the visual reading order consistent.

### 5. Panel wrapper gets `id="share-shelf"`

Add `id="share-shelf"` to the existing `<div className="mb-6">` that wraps `<ShareShelfPanel>` in `app/page.tsx`. No component prop changes needed — the wrapper lives in the page, the panel itself is unchanged.

### 6. New dictionary keys under the existing `share` block

Add to both `en.json` and `es.json`:
- `share.buttonLabel`: `"Share"`
- `share.buttonTooltip`: `"Open the share panel to mint, rotate, or disable the public link"`

Spanish parallels live in `es.json`. The key `share.title` already exists and is reused as the link&apos;s accessible name where appropriate; the visible label uses `share.buttonLabel`.

## Risks / Trade-offs

- **Native `title` shows after a delay and is not stylable** → matches the rest of the app&apos;s affordances; a custom tooltip can replace it later without changing the spec.
- **`#share-shelf` is a magic string** → minor. The page and the button are colocated in `app/page.tsx`, so the link is easy to keep in sync. If we ever move the panel to a separate route or extract it into a server component, we will need a single source of truth.
- **No `scroll-margin-top` on the anchor target** → the page has a sticky `nav-header`, so on small viewports the panel header may scroll under it. Mitigation: out of scope; can be added in a follow-up if it surfaces as a complaint.
- **Visitors on touch devices never see the `title` tooltip** → they will see the button label, the panel heading, and the description, which is enough to understand what `Share` does.

## Migration Plan

1. Extend `LinkButton` in `app/components/ui.tsx` to forward `title` and `aria-label`.
2. Add `id="share-shelf"` to the wrapper around `<ShareShelfPanel>` in `app/page.tsx`.
3. Add the `Share` `<LinkButton>` between `Import` and `Add book` in `app/page.tsx`.
4. Add `share.buttonLabel` and `share.buttonTooltip` keys in both dictionaries.

Rollback: revert the four-file diff. No DB or schema changes.

## Open Questions

None.
