## Why

The public shelf currently lists every book grouped into four status sections, and once a shelf grows past a few dozen entries the page becomes a long scroll with no way to focus on a subset. Visitors often know what they came for ("did she read Project Hail Mary?") and want to find it without scanning every row.

## What Changes

- Let visitors collapse and expand each status section on the public shelf. Sections start expanded; collapsing one hides its body but keeps the heading and count visible so visitors can still see the totals at a glance.
- Add a search box at the top of the public shelf that filters the visible books by title or author. The filter is client-side, case-insensitive, and applies across all sections. Empty query restores the full shelf.
- Localize the new strings in both `en` and `es` dictionaries.

## Capabilities

### New Capabilities
- `public-shelf-filter-search`: collapsible status sections and a client-side title/author search on the public shelf.

### Modified Capabilities
- None. The `public-shelf-share` spec continues to govern the public shelf page; this change adds new optional controls without changing the read-only contract or hiding books from anyone.

## Impact

- `app/components/public-shelf-view.tsx`: split into a small server wrapper plus a new client component that owns collapse state and the search input. The status sections remain server-rendered; only their visibility and the search filter live in client state.
- `app/components/public-shelf-controls.tsx`: new client component rendering the search input and (optionally) the section collapse/expand buttons.
- `lib/i18n/en.json` and `lib/i18n/es.json`: new keys under `publicShelf` for `searchPlaceholder`, `searchLabel`, `collapseSectionAria`, `expandSectionAria`, and `noMatches`.
- No database, schema, or middleware changes. No new server actions.
