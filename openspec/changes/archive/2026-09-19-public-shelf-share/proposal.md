## Why

A user can already share their shelf with accepted friends, but there is no way to share it with people outside the friend graph — e.g. posting a link on social media or sending it to someone who hasn't signed up. Today, anyone who opens a non-friend link either hits the Clerk sign-in screen or sees an empty placeholder, which makes the shelf effectively invisible from the open web.

## What Changes

- Add a public share link per user. The owner can mint, rotate, and disable it from a small panel on their shelf page.
- Add a new public route `/share/[token]` that resolves a token to an owner's shelf and renders it read-only, with no authentication required.
- The public shelf lists every book grouped by status, showing title, author, status, formats, all relevant dates, the note, and the cover. Metadata JSON is hidden in v1.
- The public view is read-only. Signed-out visitors see a CTA to sign up; signed-in visitors see no extra actions.
- Add the home route prefix `/` to the public-route matcher in `proxy.ts` is unchanged — only `/share/[token]` is newly public.
- Localize all new strings in both `en` and `es` dictionaries.

## Capabilities

### New Capabilities
- `public-shelf-share`: owning, minting, rotating, and disabling a per-user public shelf link; rendering an owner's shelf at `/share/[token]` for any visitor without authentication.

### Modified Capabilities
- None. The `book-shelf` spec already permits per-status views and read-only rendering; the public view reuses those patterns but introduces no new shelf-level requirement.

## Impact

- `lib/db/schema.ts`: add `public_shelf_token` (nullable uuid) and `public_shelf_enabled` (bool, default false) to `users`.
- `lib/users.ts`: helpers `getPublicShelfByToken`, `mintPublicShelfToken`, `rotatePublicShelfToken`, `disablePublicShelf`.
- `lib/books.ts`: existing `listBooks` / `countBooksByStatus` are reused as-is.
- `app/share/[token]/page.tsx`: new public shelf page.
- `app/components/public-shelf-view.tsx`: new read-only view component (status sections, no edit/delete/recommend actions).
- `app/components/share-shelf-panel.tsx`: new owner-facing panel with mint / rotate / disable + copyable URL.
- `app/share/[token]/page.tsx`: integrates `BookList` rendering via the new `publicView` mode (or a dedicated read-only list — design will decide).
- `app/components/book-list.tsx`: add a `publicView` boolean prop (sibling to `friendView`) that hides actions and disables the grid toggle.
- `app/page.tsx`: mount `ShareShelfPanel` for the signed-in owner.
- `app/actions/sharing.ts`: new server actions `mintShareTokenAction`, `rotateShareTokenAction`, `disableShareTokenAction`.
- `proxy.ts`: add `/share(.*)` to `isPublicRoute`.
- `lib/i18n/en.json` and `lib/i18n/es.json`: new `share` and `publicShelf` dictionary blocks.
- `drizzle/0005_*.sql`: migration adding the two `users` columns.
