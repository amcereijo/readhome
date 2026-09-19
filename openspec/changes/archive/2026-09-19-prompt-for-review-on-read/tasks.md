## 1. i18n

- [x] 1.1 Add `reviewPromptTitle`, `reviewPromptDescription`, `reviewPlaceholder`, `saveWithReview`, `skipReview`, and `continueToRead` keys under `shelf` in `lib/i18n/en.json`
- [x] 1.2 Add matching keys under `shelf` in `lib/i18n/es.json`

## 2. Server action

- [x] 2.1 In `app/actions/books.ts`, update `changeBookStatusAction` to read `note` from `formData` (default empty string), and pass it through to `updateBook` only when the previous status is not `read` and the new status is `read` AND the trimmed note is non-empty
- [x] 2.2 Verify that callers without a `note` field (none today, but keep the change safe) get the same behavior as before: status change only, note preserved

## 3. ChangeStatusButton UI

- [x] 3.1 In `app/components/change-status-button.tsx`, add local `step` state (`"status" | "review"`) and local `note` state (string) to the component
- [x] 3.2 Render the existing status `<form>` on step `"status"`, but replace the submit button with a Next/Save control: when the chosen `<select>` value is `read`, the button label is `continueToRead` and clicking it advances to `step = "review"` without submitting; for any other value the button submits the form as today
- [x] 3.3 Render a second `<form>` (same `formAction` target) on step `"review"` with a hidden `id`, a hidden `status="read"`, a `<TextArea name="note" placeholder={dictionary.shelf.reviewPlaceholder} value={note} onChange={...} />`, and two buttons: a primary `saveWithReview` submit and a `skipReview` submit that posts `skip=1` so the server action treats it as no note change
- [x] 3.4 Reset both `step` and `note` to their initial values whenever the modal closes (the existing Cancel/backdrop click paths)

## 4. Verify

- [x] 4.1 `npm run lint` passes with no new errors
- [x] 4.2 `npm run build` passes
- [x] 4.3 Manual smoke: change a `reading` book to `read` and type a note — note persists, status is `read`, page reflects the new note
- [x] 4.4 Manual smoke: change a `reading` book to `read` and skip the review — status becomes `read`, existing note (if any) is unchanged, no review is created
- [x] 4.5 Manual smoke: change a `reading` book to `to-read` — single-step modal, no review prompt, status changes as today

## 5. Automated test for the review-prompt logic

- [x] 5.1 Extract the note-decision logic from `changeBookStatusAction` into a pure helper `computeNextNote` in `lib/books.ts` so it can be unit-tested without Clerk
- [x] 5.2 Update `changeBookStatusAction` in `app/actions/books.ts` to call `computeNextNote` (behavior preserved)
- [x] 5.3 Write `scripts/smoke-review-prompt.ts` covering: move to read with text saves note; move to read with empty/skipped input preserves existing note; non-read target ignores submitted note; same-status ignores submitted note; end-to-end persistence via `createBook`/`updateBook`
- [x] 5.4 Add `db:smoke:review-prompt` npm script and run it; pass
