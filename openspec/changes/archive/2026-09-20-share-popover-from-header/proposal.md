## Why

The share controls used to live as a full-width card under the shelf header. We just added a `Share` button to the header that scrolls down to that card. With the affordance now at the top of the page, the inline card is redundant: the button should *open* the controls, not point at them. We want one entry point.

## What Changes

- Remove the inline `<ShareShelfPanel>` card from the owner&apos;s home shelf page.
- Convert the header `Share` button into a popover trigger. Activating the button opens a popover anchored to the button that contains the same controls (mint, rotate, disable, copy URL).
- Show a small teal indicator dot next to the `Share` label whenever sharing is enabled, so the owner can tell at a glance whether the link is live.
- Popover closes on outside click and on `Escape`.
- Localize the indicator&apos;s accessible label and any new popover strings in both `en` and `es` dictionaries.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `public-shelf-share`: the share controls SHALL be reachable only from the header `Share` button, which opens a popover anchored to that button; the inline panel on the shelf page SHALL NOT be rendered; the header `Share` button SHALL display an on/off indicator reflecting `public_shelf_enabled`.

## Impact

- `app/components/share-shelf-popover.tsx`: new client component that renders the trigger button and the popover panel. Owns open state, click-outside dismissal, `Escape` dismissal, and reuses the existing mint/rotate/disable server actions.
- `app/components/share-shelf-panel.tsx`: deleted. Its body (icon, heading, description, URL field, copy button, rotate, disable, create) moves into the popover.
- `app/page.tsx`: drop the inline `<div id="share-shelf">` wrapper and `<ShareShelfPanel>` import; mount `<ShareShelfPopover>` instead.
- `lib/i18n/en.json` and `lib/i18n/es.json`: add `share.buttonLabelActive` (the indicator&apos;s accessible label, e.g. &quot;Sharing is on&quot;) under the existing `share` block. The existing `share.buttonLabel`, `share.buttonTooltip`, and `share.*` panel strings stay where they are used inside the popover.
- No database, schema, middleware, or server-action changes.
