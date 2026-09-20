## Why

The public-shelf-share panel currently lives as a full-width card directly under the shelf header. Owners who skim the top-right action bar (where `Import` and `Add book` already sit) miss it. We want a discoverable header affordance that points at the existing panel without re-implementing its controls.

## What Changes

- Add a `Share` button to the owner&apos;s shelf header action bar, alongside the existing `Import` and `Add book` controls.
- The button scrolls the owner to the existing share panel rather than opening a popover or duplicating controls.
- The button carries a native browser tooltip explaining what `Share` does.
- Localize the button label and the tooltip in both `en` and `es` dictionaries.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `public-shelf-share`: the owner&apos;s share panel SHALL be reachable from a `Share` button in the shelf header; the button scrolls to the panel and exposes a localized tooltip explaining its purpose. The inline panel itself is unchanged.

## Impact

- `app/page.tsx`: add a third `<LinkButton>` in the header action group. The link&apos;s `href` is an anchor that scrolls to the existing `<ShareShelfPanel>` wrapper.
- `app/components/share-shelf-panel.tsx`: receive (or render with) a stable `id` anchor target so the header link can scroll to it.
- `lib/i18n/en.json` and `lib/i18n/es.json`: add `share.buttonLabel` and `share.buttonTooltip` under the existing `share` block.
- No database, schema, middleware, or server-action changes.
