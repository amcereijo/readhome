## Why

The quick `Change status` action on a shelf row currently flips a book's status to `read` in a single step and offers no opportunity to capture a review. The natural moment to leave a note about a book is right after the reader marks it `read`, while the impression is fresh, but the UI never asks — and the existing note field lives on the full edit form, which owners rarely open after the status flip. This change makes the `Change status` flow give the owner a chance to add a review exactly when the status becomes `read`.

## What Changes

- When the owner uses the quick `Change status` action and picks `Read`, the modal becomes a two-step flow: first they confirm the status, then they are shown a note (review) textarea pre-filled empty. Saving the note step commits the status change to `read` and writes the note on the same book. Saving with an empty note still commits the status change; the book simply has no note.
- For any other target status (`to-read`, `reading`, `abandoned`), the modal behaves exactly as today: one step, save commits the status change with no note prompt.
- The server action `changeBookStatusAction` is extended to accept an optional `note` field; when the previous status was not `read` and the new status is `read`, it persists the submitted note alongside the status update. No existing call path is broken.
- All new UI strings (review prompt title, note textarea placeholder, skip/save button labels) are added to the English and Spanish dictionaries.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `book-shelf`: Add a requirement that the quick `Change status` action, when moving a book to `read`, MUST offer the owner a one-step review prompt whose save commits both the new `read` status and any note text the owner submits; an empty submission MUST still commit the status change. For all other target statuses the flow is unchanged.

## Impact

- `app/components/change-status-button.tsx` — extends the modal into a two-step flow when the selected target status is `read`; adds a note textarea step and a save-with-note submit. ~30-40 lines added.
- `app/actions/books.ts` — `changeBookStatusAction` reads an optional `note` form field and forwards it to `updateBook` only when transitioning to `read` from any other status.
- `lib/i18n/en.json`, `lib/i18n/es.json` — add new keys under `shelf` for the review prompt title, note textarea placeholder, save-with-review button, and skip button.
- No schema, auth, or DB changes; `books.note` already exists.
- No breaking changes: existing callers of `changeBookStatusAction` that do not submit `note` continue to work.
