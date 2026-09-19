## Context

See `proposal.md` for motivation and `specs/public-shelf-share/spec.md` for the behavior contract.

Today, the `users` table has no fields related to public sharing, and `proxy.ts` only allows `/`, `/sign-in(.*)`, `/sign-up(.*)`, `/invite(.*)`, and `__clerk(.*)` as public routes. The friend shelf already renders a read-only card via `BookList` with `friendView`, which gives us a proven layout to lean on but is action-rich enough that the public view needs a stricter variant. The `BookList` component currently lives entirely in the client and reads no locale data on the server; the public page is a server component, so it will fetch books directly via existing `lib/books.ts` helpers.

## Goals / Non-Goals

**Goals:**
- Add a per-user share token with mint / rotate / disable semantics, stored on `users`.
- Add a server-side `/share/[token]` route that renders the owner&apos;s shelf read-only, grouped by status, with metadata hidden.
- Reuse `BookList` by adding a `publicView` prop that mirrors the existing `friendView` pattern but hides every action and chrome element.
- Keep the public route accessible without auth by adding `/share(.*)` to `proxy.ts`.

**Non-Goals:**
- Per-link revocation or multiple concurrent share URLs.
- Per-book public visibility flags.
- Surfacing `metadata` (any key) publicly.
- OG meta tags, link previews, or SEO enhancements.
- Rate limiting or bot protection beyond Clerk middleware&apos;s defaults.
- Public stats, public recommendations, or any other public surface beyond the shelf itself.

## Decisions

### 1. One token, stored on `users`

Add two nullable columns to `users`:
- `public_shelf_token` (`text`, unique index)
- `public_shelf_enabled` (`integer` boolean, default 0)

Storing the token on `users` keeps the lookup to a single indexed query and avoids a new table. `public_shelf_enabled` exists separately so we can distinguish "never minted" from "minted then disabled" without re-parsing the token. Both columns are nullable / default off, so existing rows are unaffected.

**Alternatives considered:**
- New `public_shelf_links` table with one row per minted URL — rejected: adds a join and a second write per rotation, with no v1 need for multiple links.
- A single `public_shelf_token` column with `null` meaning "disabled" — rejected: conflates "no link yet" with "disabled," which makes the owner UI logic brittle and gives no way to tell the two states apart for analytics or a future "you disabled sharing on date X" history.

### 2. URL is `/share/[token]` with a UUID v4

Use `crypto.randomUUID()` for the token. UUIDs are 122 bits of entropy, are already used elsewhere in the codebase (e.g. `inviteLinks.token`), and let us reuse existing UUID comparison without any new encoding.

**Alternatives considered:**
- NanoID / short ID — rejected: tiny URL-golf win, no tooling upside; the codebase already standardizes on UUID.
- Signed JWT containing the owner&apos;s id — rejected: harder to revoke (you&apos;d have to rotate a signing key), no benefit at this scale.

### 3. Resolve via `getPublicShelfByToken` returning a denormalized view

`lib/users.ts` gets a single helper:
```ts
async function getPublicShelfByToken(token: string): Promise<{
  owner: { id; username; createdAt };
  books: BookRecord[];
  counts: BookCounts;
} | null>
```
It returns `null` for unknown tokens, disabled tokens, or any token whose owner has no `public_shelf_enabled = 1`. The route then renders `notFound()` when `null` is returned.

**Alternatives considered:**
- Have the route page issue separate `getUserByUsername`-style calls and assemble itself — rejected: pushes join logic into the route, duplicates `countBooksByStatus` orchestration.
- Skip denormalization and pass `ownerId` to the page, letting the page query — rejected: makes the public route do auth-free DB access on every render with two round trips; collapsing into one helper keeps the route a thin shim.

### 4. Reuse `BookList` with a new `publicView` prop

The existing `BookList` already supports `editable`, `friendView`, and a `recommendFriends` list. The cleanest extension is a sibling `publicView` boolean that:
- hides every action (`Change status`, `Edit`, `Recommend`, `Delete`, `Add to my shelf`)
- hides the sort selector and the view-mode toggle
- hides the modal/book-details disclosure (renders cards expanded by default? — see decision 5)
- hides the `see more` / `show less` toggle

**Alternatives considered:**
- Build a separate `PublicShelfList` component — rejected: duplicates ~400 lines of layout code, and a fourth component mode would erode the `BookList` props contract anyway. A boolean prop keeps the existing pattern.
- Render the public view as a server component from scratch — rejected: would not get cover thumbnails, formatting, etc. for free; the friend view already proves this layout works.

### 5. Cards on the public view render expanded by default

On the friend view, every card is collapsed with a `show details` toggle. On the public view, cards render expanded: title + author + cover + status + every meaningful date + formats + note, no toggle. The public view is one screen and one interaction (read), so collapsing + expanding is just friction. The expanded rendering already exists as `BookDetails` inside `BookList`; we just always pass `expanded=true` when `publicView`.

### 6. Status sections live in the public route, not in `BookList`

`BookList` was built around a flat list with a `ShelfNav` for filtering by status. The public page wants four sections instead — different layout. Rather than add a `groupByStatus` mode to `BookList`, the public page groups the books itself (using `BOOK_STATUSES` for canonical order) and renders four `<BookList>` instances, each pre-filtered to one status, each in `publicView` mode, and skips empty statuses. This keeps `BookList` simpler and lets the public page own its section headings and copy.

### 7. Server actions for mint / rotate / disable

Three new actions in `app/actions/sharing.ts`:
- `mintShareTokenAction(formData)` — owner-only; sets `public_shelf_token = uuid()`, `public_shelf_enabled = 1`
- `rotateShareTokenAction(formData)` — owner-only; replaces the token, leaves the enabled flag
- `disableShareAction(formData)` — owner-only; clears the token, sets enabled = 0

Each calls `requireAppUser()`, validates the caller owns the affected row (the row is implicit — it&apos;s always `user.id`), mutates, and `revalidatePath("/")` so the owner&apos;s shelf re-renders with the updated panel. No `revalidatePath` needed for `/share/[token]` because the token is server-fetched on every request.

### 8. Share panel mounted on `/` only, not on status views

The owner&apos;s share panel is mounted on the home shelf (`app/page.tsx`) inside the header area, near `Import` and `Add book`. Status views (`/to-read`, `/reading`, `/read`, `/abandoned`) are filters of the same shelf; mounting the panel there too would be redundant noise. Mounting once on `/` keeps it discoverable without duplicating it on every status page.

### 9. Middleware adds `/share(.*)` to `isPublicRoute`

Single line in `proxy.ts`. No new dynamic route segment, no per-token auth check in middleware — the page handles 404 itself. Clerk&apos;s middleware will not gate this route.

### 10. Public shelf is fully localized via the existing i18n pipeline

The page uses `getDictionaryForLocale()` like every other server route. New dictionary keys go under `share` (owner panel strings) and `publicShelf` (the public page itself: section headings, sign-up CTA, empty-state copy). Both `en.json` and `es.json` get the new keys.

## Risks / Trade-offs

- **Token leak** → tokens are 122-bit UUIDs; brute force against Turso at any realistic rate is infeasible. Rotation is one click. Mitigation: nothing further needed in v1.
- **Public exposure of all books** → owner controls exposure by minting/rotating/disabling; metadata is hidden so importers don&apos;t leak internal data. Per-book exclusion is a v2 ask.
- **No link previews / OG meta** → shared URLs render as plain links in chat/Slack. Mitigation: deferred to a follow-up change.
- **Disabled tokens remain in the DB** → `public_shelf_token` is cleared on disable, so the row carries no orphan token. No cleanup needed.
- **`BookList` `publicView` mode is a fourth behavior branch** → risks accumulating. Mitigation: it&apos;s a sibling to `friendView`, the prop is explicit, and the spec already requires every action to be hidden, which we enforce with a single early-return in the action block.
- **Public route is not rate-limited** → a sufficiently motivated attacker could enumerate. Mitigation: out of scope; flag for follow-up if abuse is observed.
- **`getPublicShelfByToken` runs `countBooksByStatus` per request** → two queries per public render. Acceptable at the scale of a personal shelf (hundreds, not millions). No mitigation needed.

## Migration Plan

1. Add the migration `drizzle/0005_*.sql` introducing the two `users` columns and a unique index on `public_shelf_token`. Backfill is unnecessary (all rows default to disabled).
2. Add `public_shelf_token` and `public_shelf_enabled` to `lib/db/schema.ts` and the `toUser` mapper in `lib/users.ts`.
3. Add `getPublicShelfByToken`, `mintPublicShelfToken`, `rotatePublicShelfToken`, and `disablePublicShelf` to `lib/users.ts`.
4. Add `app/actions/sharing.ts` with the three server actions.
5. Add `app/components/share-shelf-panel.tsx` with mint / rotate / disable UI and a copyable URL field. Mount it on `app/page.tsx`.
6. Add `app/components/public-shelf-view.tsx` (thin wrapper that fetches and groups, then renders one `BookList` per non-empty status).
7. Extend `app/components/book-list.tsx` with a `publicView` prop that hides actions, sort, view-mode, and disclosure toggle, and renders cards expanded by default.
8. Add `app/share/[token]/page.tsx` that calls `getPublicShelfByToken`, calls `notFound()` on null, and renders `<PublicShelfView>`.
9. Add `/share(.*)` to `isPublicRoute` in `proxy.ts`.
10. Add `share` and `publicShelf` blocks to `lib/i18n/en.json` and `lib/i18n/es.json`.
11. Deploy migration, then deploy app. No backfill needed. Existing users keep `public_shelf_enabled = 0`.

Rollback: revert the deploy, drop the two columns with a follow-up migration. No data loss because the columns are additive and unused for any existing flow.

## Open Questions

None.
