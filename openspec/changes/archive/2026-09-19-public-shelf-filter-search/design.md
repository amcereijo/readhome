## Context

See `proposal.md` for motivation and `specs/public-shelf-filter-search/spec.md` for the behavior contract.

The public shelf is currently rendered as a single server component (`app/components/public-shelf-view.tsx`) that loops over the four statuses and emits one `<BookList publicView>` per non-empty section. Every render happens on the server. To add a search input and per-section collapse state, the page needs at least one client component to own those bits of state. The data fetching and section layout can stay server-side — only the visibility-of-section-body and the search filter need to live in the browser.

## Goals / Non-Goals

**Goals:**
- Add a client-side search input at the top of the public shelf that filters visible books by case-insensitive substring match on title or author.
- Add per-section collapse/expand toggles to every status section heading.
- Keep the page server-rendered for the parts that do not need client state (snapshot fetch, section headings, `<BookList publicView>` rendering).

**Non-Goals:**
- URL-driven filters (`?q=…&status=…`) — out of scope; the spec calls for in-page client state only.
- Server-side search or pagination — out of scope; the spec mandates client-side filtering.
- Diacritic-insensitive matching, fuzzy matching, or ranking — out of scope; plain `String.prototype.includes` after `toLowerCase()` is the spec.
- Persisting collapse or search state across page reloads — out of scope; state is per visit.
- Hiding books from anyone based on the search — out of scope; the search only filters what is *rendered* in the visitor&apos;s view.

## Decisions

### 1. Lift state into a single client wrapper, keep `<BookList>` server-free

Today the public page is a server component. Adding a search input + collapse state means turning *something* into a client component. Two options:

- **A: Turn `PublicShelfView` itself into a client component.** Whole page ships to the browser, but it is small (no DB queries, just data passed as props).
- **B: Split the page in two: a server wrapper that fetches and groups, and a small client wrapper that owns the search input and collapse state, rendering each status section body.**

Going with **B**. The server wrapper does the data work and renders the search input + section headers + section bodies via the client wrapper. The client wrapper owns `query` and `collapsedSections` state and decides whether to render each section&apos;s body. This keeps the data path server-side, the JS payload small, and lets us reuse `<BookList publicView>` without turning it into a client boundary that has to receive serialized props.

**Alternative considered:** Hoisting the search and collapse state into a URL via `useSearchParams` and reading them server-side. Rejected — the spec explicitly puts the search in client state.

### 2. Use a controlled `<input type="search">` for the query

The search input is a controlled `<input type="search">` with `value={query}` and `onChange={(e) => setQuery(e.target.value)}`. `type="search"` gives browsers a free clear-button affordance and the right semantics. State lives in `useState` inside the client wrapper.

**Alternative considered:** Uncontrolled with a ref. Rejected — controlled is simpler for a single field and makes the React state the source of truth, which we need anyway to drive the filter.

### 3. Match with `String.prototype.includes` after `toLowerCase()`

The filter is `book.title.toLowerCase().includes(q) || (book.author?.toLowerCase().includes(q) ?? false)`. No regex, no normalization, no diacritic folding — the spec does not require it and the rest of the app uses the same plain substring approach (`recommend-panel.tsx` already does `friend.username?.toLowerCase().includes(q)`).

**Alternative considered:** `Intl.Collator` with `sensitivity: "base"` for diacritic- and case-insensitive matching in one pass. Rejected as overkill for v1; can be added later without changing the spec.

### 4. Collapse state is a `Set<BookStatus>` inside the client wrapper

`const [collapsed, setCollapsed] = useState<Set<BookStatus>>(new Set())`. A section is collapsed when its status is in the set. Toggle: `setCollapsed((prev) => { const next = new Set(prev); next.has(status) ? next.delete(status) : next.add(status); return next; })`. Sections with zero books are still omitted by the server-side pre-filter, so the client never has to consider them.

**Alternative considered:** A single `expandedAll: boolean` with one master toggle. Rejected — the spec requires independent per-section toggles.

### 5. No-matches message renders once at the top

When `query.trim()` is non-empty and the filter produces zero books across all sections, the client wrapper renders a single localized `noMatches` message above the section list (or in place of the section list — design choice; once at the top is enough). The section headings remain visible with their counts so the visitor sees what the shelf contains regardless.

**Alternative considered:** Per-section "no matches" copy. Rejected — duplicates the message up to four times on a small shelf and adds noise.

### 6. `<BookList>` is reused unchanged

`BookList` does not know about the search or collapse state. The client wrapper decides whether to render a section body at all (collapsed → render nothing; query active → filter the books before passing them in). This keeps `<BookList publicView>` doing exactly what it did before and keeps the spec from leaking into a component that already has its own opinions.

### 7. New dictionary keys under `publicShelf`

Add to `lib/i18n/en.json` and `lib/i18n/es.json`:
- `publicShelf.searchPlaceholder`
- `publicShelf.searchLabel` (the `aria-label` for the input)
- `publicShelf.collapseSectionAria` (e.g. "Collapse Reading section")
- `publicShelf.expandSectionAria` (e.g. "Expand Reading section")
- `publicShelf.noMatches`

Both dictionaries get parallel Spanish strings.

## Risks / Trade-offs

- **Search runs on the full book list in the browser** → fine for personal shelves; would need server-side search past a few hundred books. Out of scope; documented in the spec.
- **Case-insensitive only, not diacritic-insensitive** → a Spanish shelf with "Ángela" won&apos;t match a query of "angela" via the lowercase `includes`. Mitigation: matches the rest of the app&apos;s search behavior; can upgrade to `Intl.Collator` later without changing the spec or the call sites.
- **No persistence** → refresh resets both query and collapse state. Acceptable for the public shelf&apos;s "skim once" usage pattern.
- **No URL filter** → visitors can&apos;t share a filtered link to their friend. The spec does not require it; could be a v2.
- **State lives in a single client component** → if a future change wants to make the search URL-driven, the wiring has to move up to the page component. Not blocking; design notes the boundary.
- **`<input type="search">` clears on Escape in some browsers but not all** → not relied on; we render no separate clear button in v1.

## Migration Plan

1. Add the new dictionary keys to `en.json` and `es.json`.
2. Split `app/components/public-shelf-view.tsx`: rename the existing server component to `PublicShelfView` (server) that pre-groups books by status and renders one `<PublicShelfSection>` per non-empty status, passing each section its books, status, count, locale, and dictionary. Add a new `PublicShelfControls` client component that owns search and collapse state and renders the search input + the section bodies (or nothing if collapsed).
3. Wire `app/share/[token]/page.tsx` to render the new server `PublicShelfView` (signature unchanged from the caller&apos;s perspective).

Rollback: revert the deploy. No DB or schema changes.

## Open Questions

None.
