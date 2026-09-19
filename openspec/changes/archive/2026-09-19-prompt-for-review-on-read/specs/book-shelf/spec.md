## ADDED Requirements

### Requirement: Quick change-status flow offers a review prompt when moving to read
The system SHALL offer the owner a one-step review prompt inside the quick `Change status` action when the selected target status is `read`. The prompt MUST present a note (review) textarea pre-filled empty and a save action whose submission commits the status change to `read` together with the submitted note text on the same book. If the owner submits the prompt with an empty note, the system MUST still commit the status change to `read` and MUST leave the book's note unchanged. For every other target status (`to-read`, `reading`, `abandoned`), the quick `Change status` action SHALL behave exactly as before: a single-step confirmation that commits only the status change.

#### Scenario: Move to read and add a review
- **WHEN** the owner uses the quick `Change status` action on a book that is not already `read`
- **AND** the owner selects `read` as the target status
- **AND** the owner types text into the review prompt's note textarea
- **AND** the owner submits the review prompt
- **THEN** the system stores the book with status `read`
- **AND** the system stores the submitted text as the book's note

#### Scenario: Move to read and skip the review
- **WHEN** the owner uses the quick `Change status` action on a book that is not already `read`
- **AND** the owner selects `read` as the target status
- **AND** the owner submits the review prompt without entering any note text
- **THEN** the system stores the book with status `read`
- **AND** the system does not change the book's existing note (or leaves the note empty if there was none)

#### Scenario: Move to a non-read status has no review prompt
- **WHEN** the owner uses the quick `Change status` action on a book
- **AND** the owner selects a target status other than `read`
- **THEN** the system shows only the status-confirmation step
- **AND** submitting the status-confirmation step commits the new status
- **AND** no review prompt is shown and no note field is submitted

#### Scenario: Review prompt is localized
- **WHEN** the quick `Change status` action shows the review prompt for a `read` target
- **THEN** every label and button in the prompt is rendered in the active locale
