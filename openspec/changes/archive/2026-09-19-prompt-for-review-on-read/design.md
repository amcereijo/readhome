## Context

Today the quick `Change status` action on a shelf row is a single-step modal: pick a status from a `<select>` and submit. The server action `changeBookStatusAction` in `app/actions/books.ts` reads `id` and `status` from the form, validates ownership, and forwards a copy of the existing book to `updateBook` with only the status field changed. There is no path through this action that writes the book's `note` column.

The full edit form (`app/components/edit-book-form.tsx`) already handles `note`, but it is the wrong moment to ask for a review — owners open it rarely. The right moment is the status flip itself.

## Goals / Non-Goals

**Goals:**

- Add a second step to the quick `Change status` modal that appears only when the chosen target status is `read`, and lets the owner enter a note in the same submit.
- Persist the note in the same server call that updates the status, so there is exactly one `updateBook` invocation per status flip.
- Keep the existing single-step behavior for `to-read`, `reading`, and `abandoned`.
- Localize all new copy in English and Spanish.

**Non-Goals:**

- Do not change the full edit form's note behavior, the `updateBookAction` server action, or the `books` schema.
- Do not auto-populate the review textarea from existing data; always start empty.
- Do not make the review prompt mandatory; empty note submits still commit the status change.

## Decisions

### 1. Two-step modal in `change-status-button.tsx`

Add a local `step` state (`"status" | "review"`) and a local `note` state to the component. The first render of the modal is the status `<select>` (unchanged from today). When the form is submitted and `state.success` flips (which the existing `useEffect` already handles), or — better — when the owner clicks a "Move to Read" advance button instead of the form's native submit, the modal transitions to the review step pre-filled with `note = ""`. The review step renders a `<TextArea>` plus Save and Cancel buttons, where Save submits a form that posts both the original `id`, the chosen status (`read`), and the typed `note` to `changeBookStatusAction`.

Approach chosen: keep the existing `<form action={formAction}>` for the status step, and add a second small `<form action={formAction}>` for the review step that submits `id`, `status="read"`, and `note`. This avoids any new client/server plumbing. The transition from step 1 to step 2 happens inside the same `useActionState` cycle by reading the submitted status from the `<select>` and advancing before the form actually submits — but since the existing flow already submits via `formAction` directly, the simpler path is: make step 1 a non-submitting view with an explicit "Next" button that just sets `step = "review"` when the chosen status is `read`, or submits directly when it is not.

**Alternative considered**: Show the review prompt as a separate modal after the status change succeeds. Rejected — that splits one user intent across two popups, requires extra `useEffect` wiring, and risks the modal closing mid-flow on `router.refresh()`.

### 2. Single server action accepts optional `note`

Extend `changeBookStatusAction` to read `String(formData.get("note") ?? "")` and forward it to `updateBook` only when the new status is `read` AND the previous status is not `read`. For any other target, ignore the submitted note. This keeps `updateBook`'s behavior identical for existing callers and for the non-read target statuses.

**Alternative considered**: Add a new server action `addReviewAction`. Rejected — it would require two network round-trips and a temporary "status has been changed, now adding review" state on the client. Single action, single submit keeps the data consistent.

### 3. Empty note == no-op on the note column

When the submitted note is empty (or only whitespace), `changeBookStatusAction` MUST NOT pass `note` through to `updateBook` so the existing note value is preserved. The status change still commits. This matches the spec scenario "Move to read and skip the review".

### 4. i18n keys live under `shelf`

Add to `lib/i18n/en.json` and `lib/i18n/es.json`:
- `shelf.reviewPromptTitle` — e.g. "Add a quick review?"
- `shelf.reviewPromptDescription` — one-sentence helper text
- `shelf.reviewPlaceholder` — e.g. "What did you think?"
- `shelf.saveWithReview` — primary button label, e.g. "Save review"
- `shelf.skipReview` — secondary button label, e.g. "Skip"
- `shelf.continueToRead` — only used on the status step when the chosen status is `read`, e.g. "Continue"

The step-1 `Next` button label reuses `shelf.continueToRead` so step 1 stays one button regardless of the picked status.

## Risks / Trade-offs

- [Two-step modal in one component] → Step state and form state live in the same component, which already has a `useActionState` for the status form. Keep the second form's state separate (use a local `useState` for the review textarea) so a failed first submit does not wipe the typed review.
- [Existing callers of `changeBookStatusAction` that omit `note`] → The action reads `note` as an empty string when absent and ignores it for non-`read` targets; behavior is byte-identical for current call sites.
- [The compact owner card shows the note on expand] → If an empty submit happens, the book's existing note (if any) is preserved, so the disclosure remains correct. New reviews appear in the disclosure on next render.
- [Cancel from the review step] → Cancel resets `step` to `"status"` and clears the local `note` so the modal reopens at step 1 next time. This matches the modal-close button's existing behavior.

## Migration Plan

No data migration needed (`books.note` already exists, no schema change). Roll-forward only. Rollback is a single revert of the two changed files.

## Open Questions

None that affect specs, approach, or task breakdown.
