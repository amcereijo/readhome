## 1. Schema and migration

- [x] 1.1 Add `public_shelf_token` (nullable text, unique index) and `public_shelf_enabled` (integer, default 0) to `lib/db/schema.ts` `users` table and to the `toUser` mapper in `lib/users.ts`.
- [x] 1.2 Generate the Drizzle migration file under `drizzle/0005_*.sql` adding the two columns and a unique index on `public_shelf_token`. Verify it applies cleanly against the local SQLite database.

## 2. Data helpers

- [x] 2.1 Add `getPublicShelfByToken(token)` to `lib/users.ts`: returns `{ owner, books, counts }` when the token matches a row with `public_shelf_enabled = 1`, otherwise `null`.
- [x] 2.2 Add `mintPublicShelfToken(userId)`, `rotatePublicShelfToken(userId)`, and `disablePublicShelf(userId)` to `lib/users.ts`. Each uses `crypto.randomUUID()` where applicable.
- [x] 2.3 Extend the `AppUser` type in `lib/types.ts` to include the new optional fields.

## 3. Server actions

- [x] 3.1 Create `app/actions/sharing.ts` with `mintShareTokenAction`, `rotateShareTokenAction`, and `disableShareAction`. Each calls `requireAppUser()` and `revalidatePath("/")` after the mutation.

## 4. Owner share panel

- [x] 4.1 Create `app/components/share-shelf-panel.tsx`. Client component that reads the current share state from props and renders the right control (mint / rotate / disable + copyable URL).
- [x] 4.2 Add the `share` block (panel strings) to `lib/i18n/en.json` and `lib/i18n/es.json`.
- [x] 4.3 Mount `<ShareShelfPanel>` inside `app/page.tsx`, near the existing import/add-book controls.

## 5. `BookList` public view mode

- [x] 5.1 Add a `publicView?: boolean` prop to `BookList` in `app/components/book-list.tsx`. When true: hide sort selector, hide view-mode toggle, hide modal/grid, hide disclosure toggle, render cards expanded by default, render no action buttons.
- [x] 5.2 Verify the existing owner and friend views still render identically when `publicView` is unset.

## 6. Public shelf page

- [x] 6.1 Create `app/components/public-shelf-view.tsx` (server component) that takes an owner and the pre-fetched book lists per status and renders four sections in canonical order, omitting empty ones.
- [x] 6.2 Add the `publicShelf` block (section heading, count, sign-up CTA, empty state) to `lib/i18n/en.json` and `lib/i18n/es.json`.
- [x] 6.3 Create `app/share/[token]/page.tsx`. It calls `getPublicShelfByToken`, returns `notFound()` on null, checks Clerk session for the sign-up CTA, and renders `<PublicShelfView>`.

## 7. Middleware

- [x] 7.1 Add `/share(.*)` to `isPublicRoute` in `proxy.ts`.

## 8. Validation

- [x] 8.1 Run `npm run lint` and `npm run typecheck` (or `npx tsc --noEmit`) — confirm no errors.
- [x] 8.2 Manually verify in the browser: signed-out visitor opens `/share/<token>` → renders the shelf without redirect; rotating the token makes the old URL 404; disabling sharing 404s the URL; the owner&apos;s shelf shows the panel and remains editable.
