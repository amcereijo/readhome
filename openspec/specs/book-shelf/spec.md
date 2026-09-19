## Purpose

Lets a signed-in person keep a personal list of books with status, formats, optional dates, and a single note, and browse that list as all books or by status.

## Requirements

### Requirement: Create a book in any status
The system SHALL allow the owner to create a book in any of these statuses: `to-read`, `reading`, `read`, `abandoned`. Title is the only required field. Formats, `started_at`, `finished_at`, `abandoned_at`, and the note MAY be omitted.

#### Scenario: Create with only a title
- **WHEN** the owner submits a new book with a non-empty title and a status, and no other fields
- **THEN** the system stores the book on their shelf in that status

#### Scenario: Title is required
- **WHEN** the owner submits a new book with an empty title
- **THEN** the system MUST NOT store the book
- **AND** the system informs them that a title is required

#### Scenario: Create into Read
- **WHEN** the owner submits a new book with a title and status `read`
- **THEN** the system stores the book as `read` without requiring dates, formats, or a note

### Requirement: Move a book to any status
The system SHALL allow the owner to change a book's status from any status to any other status among `to-read`, `reading`, `read`, and `abandoned`.

#### Scenario: Move from To Read to Abandoned
- **WHEN** the owner changes a `to-read` book to `abandoned`
- **THEN** the system stores the book as `abandoned`

#### Scenario: Move from Read back to Reading
- **WHEN** the owner changes a `read` book to `reading`
- **THEN** the system stores the book as `reading`

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

### Requirement: Dates stay empty unless the owner sets them
The system MUST NOT write `started_at`, `finished_at`, or `abandoned_at` as a side effect of creating a book or changing its status. The owner MAY set, change, or clear those fields independently of status.

#### Scenario: Status change does not stamp a date
- **WHEN** the owner moves a book to `reading`, `read`, or `abandoned` without submitting a date
- **THEN** the corresponding date field remains empty

#### Scenario: Owner sets a date
- **WHEN** the owner sets `finished_at` on a book
- **THEN** the system stores that date
- **AND** the book's status is unchanged unless the owner also changes status

### Requirement: Many formats per book
The system SHALL allow a book to have zero or more formats. Allowed formats are `paperback`, `hardcover`, `ebook`, and `audiobook`. The owner MAY add or remove formats at any time.

#### Scenario: Add multiple formats
- **WHEN** the owner sets a book's formats to `paperback` and `ebook`
- **THEN** the system stores both formats on that book

#### Scenario: Book with no formats
- **WHEN** the owner creates or edits a book without choosing a format
- **THEN** the system stores the book with an empty format list

### Requirement: Single editable note
The system SHALL store at most one note per book. The owner MAY set, replace, or clear that note at any time.

#### Scenario: Add a note
- **WHEN** the owner saves a note on a book that had none
- **THEN** the system stores that note on the book

#### Scenario: Edit a note
- **WHEN** the owner saves a different note on a book that already has one
- **THEN** the system replaces the previous note with the new text

### Requirement: Delete own book
The system SHALL allow the owner to delete a book from their shelf. After deletion the book MUST NOT appear on any of their views.

#### Scenario: Owner deletes a book
- **WHEN** the owner deletes a book
- **THEN** the system removes it from their shelf
- **AND** the book no longer appears on the all-books view or any status view

### Requirement: Own-shelf views
The system SHALL provide the owner an all-books view that can be filtered by status, and a dedicated view for each status (`to-read`, `reading`, `read`, `abandoned`). Each status view SHALL list only books in that status. Only the owner and accepted friends can see these views; friend visibility is defined by the friendships capability. When a book has an `author` value, each view SHALL display the author alongside the title. The home route (`/`) SHALL serve the owner's shelf view when the visitor is signed in, and the public landing page when the visitor is not signed in. All labels and navigation text in these views SHALL be translated according to the active locale. Each book card in the owner's all-books view and each status-filtered owner view SHALL include a `Recommend` action that opens the recommendation panel defined by the recommendations capability. The owner-facing row actions on each book card (`Change status`, `Edit`, `Recommend`, `Delete`) SHALL render as icon-only buttons with localized `aria-label`s so the actions are dense, recognizable, and announced to assistive technology in the active locale.

#### Scenario: All-books view lists every book
- **WHEN** the owner opens the all-books view with no status filter
- **THEN** the system lists every book on their shelf
- **AND** books with an author display the author next to the title
- **AND** page labels are shown in the active locale
- **AND** each book card displays a `Recommend` action

#### Scenario: Filter all-books by status
- **WHEN** the owner applies a status filter of `reading` on the all-books view
- **THEN** the system lists only their books with status `reading`
- **AND** books with an author display the author next to the title
- **AND** status labels are shown in the active locale
- **AND** each book card displays a `Recommend` action

#### Scenario: Dedicated status view
- **WHEN** the owner opens the `to-read` view
- **THEN** the system lists only their books with status `to-read`
- **AND** books with an author display the author next to the title
- **AND** the status label is shown in the active locale
- **AND** each book card displays a `Recommend` action

#### Scenario: Signed-in user sees shelf on home route
- **WHEN** a signed-in user opens `/`
- **THEN** the system displays their shelf view in the active locale
- **AND** each book card on the owner's view displays a `Recommend` action

#### Scenario: Signed-out visitor sees landing page on home route
- **WHEN** a visitor who is not signed in opens `/`
- **THEN** the system displays the public landing page in the active locale

#### Scenario: Owner row actions are icon-only
- **WHEN** the owner views any of their own shelf views
- **THEN** each book card displays `Change status`, `Edit`, `Recommend`, and `Delete` as icon-only buttons
- **AND** each icon-only button has a localized `aria-label` in the active locale

### Requirement: Compact owner book card with details toggle
The system SHALL render each owner-facing book card (all-books view and each owner status view) as a compact row that shows only the book title with author (when present), the status badge, the single most recent meaningful date using the localized label for that date kind (`Finished`, `Started`, `Abandoned`, or `Added`), and the existing icon-only row actions (`Change status`, `Edit`, `Recommend`, `Delete`). The compact row MUST NOT display formats, every meaningful date, or a note preview by default. The system SHALL provide an icon-only `Show details` toggle button on each owner card that opens a disclosure of formats (when present), every meaningful date with its localized label and value, the note (when present), and any imported metadata; activating the toggle a second time SHALL collapse the disclosure back to the compact row. The toggle's `aria-label` and icon MUST be localized through the active locale dictionary, and the disclosure content MUST remain keyboard reachable.

#### Scenario: Compact owner card shows title, author, status, last meaningful date, and row actions
- **WHEN** the owner views the all-books view or any owner status view
- **THEN** each book card displays the title and author (when present), the status badge, a single date line with the most recent of `finished_at`, `started_at`, `abandoned_at`, `date_added` (each rendered with its localized label)
- **AND** each card displays the existing `Change status`, `Edit`, `Recommend`, and `Delete` icon-only actions
- **AND** the card does NOT display the formats list, every meaningful date, or a note preview by default

#### Scenario: Owner expands details
- **WHEN** the owner activates the `Show details` toggle on a card
- **THEN** the card reveals a disclosure that lists formats (when present), every meaningful date with its localized label and value, the note (when present), and any imported metadata
- **AND** the disclosure content is keyboard reachable

#### Scenario: Owner collapses details
- **WHEN** the owner activates the toggle again on a card whose disclosure is open
- **THEN** the disclosure collapses back to the compact row
- **AND** the toggle's `aria-label` reverts to the localized `Show details` text

#### Scenario: Missing dates fall back to date added
- **WHEN** a book has no `finished_at`, `started_at`, or `abandoned_at`
- **THEN** the compact row shows the `Added` date with the book title, author, status, and row actions

#### Scenario: Friend view is unchanged
- **WHEN** an accepted friend views the owner's shelf
- **THEN** the owner-facing compact card and new toggle are not rendered
- **AND** the friend sees the existing friend-view card unchanged

### Requirement: Recommend from the owner's book edit view
The system SHALL provide a `Recommend` action on the owner's book edit/detail view. The action SHALL open the same recommendation panel used by the book list, and SHALL NOT submit the edit form when invoked.

#### Scenario: Click Recommend from edit view
- **WHEN** the owner clicks `Recommend` on their book edit/detail view
- **THEN** the system opens the recommendation panel
- **AND** the edit form is not submitted

### Requirement: Book row shows a cover thumbnail
Each book row in the all-books view, each owner status view (`/to-read`, `/reading`, `/read`, `/abandoned`), and each friend shelf view SHALL display a cover thumbnail at the left of the row whenever the book has a `metadata.coverUrl`. When the cover is missing or fails to load, the row SHALL display the localized cover placeholder in the same slot.

#### Scenario: Owner row renders the cover
- **WHEN** the owner views any of their shelf views
- **THEN** each book card displays the book's cover thumbnail (or the placeholder) at the left of the row, before the title block

#### Scenario: Friend row renders the cover
- **WHEN** an accepted friend views the owner's shelf
- **THEN** each book card displays the book's cover thumbnail (or the placeholder) at the left of the row, before the title block

## ADDED Requirements

### Requirement: Shelf view mode toggle
The shelf SHALL offer a view-mode toggle that lets the viewer switch between a list view and a grid view. The toggle SHALL appear in the existing shelf toolbar, next to the sort selector, as two icon-only buttons with localized aria-labels.

#### Scenario: First-time viewer sees list
- **WHEN** the viewer has not previously selected a view mode on this device
- **THEN** the shelf renders in list view

#### Scenario: Returning viewer sees remembered mode
- **WHEN** the viewer previously selected grid view on this device
- **AND** the viewer reopens the shelf in a later session
- **THEN** the shelf renders in grid view without the viewer having to toggle

#### Scenario: Viewer switches to grid
- **WHEN** the viewer activates the grid toggle
- **THEN** the shelf re-renders in grid view
- **AND** the choice is remembered on this device

#### Scenario: Viewer switches back to list
- **WHEN** the viewer is in grid view and activates the list toggle
- **THEN** the shelf re-renders in list view
- **AND** the choice is remembered on this device

### Requirement: Grid view renders each book as a cover card
In grid view, the shelf SHALL render each book as a card whose layout adapts column count to the viewport width. Each card SHALL display the cover image (or the existing placeholder when no cover is available), the title, the author, the status badge, and the most relevant date for that status. The cover image SHALL be displayed at portrait aspect ratio.

#### Scenario: Grid card content
- **WHEN** the shelf renders in grid view
- **THEN** each card displays the book's cover, title, author, status badge, and a date chosen from `finished → started → abandoned → added` based on the book's status

#### Scenario: No cover available
- **WHEN** a book has no cover URL
- **THEN** the grid card displays the same placeholder used in list view

#### Scenario: Column count adapts to viewport
- **WHEN** the viewport width changes
- **THEN** the number of grid columns adjusts so cards remain readable without horizontal scrolling

### Requirement: Grid view opens a modal for book details
In grid view, selecting a book SHALL open a modal that shows the same book details currently shown when expanding a row in list view, plus the actions available to the viewer. The modal SHALL close when the viewer clicks outside it or presses the `Esc` key.

#### Scenario: Owner opens their own book
- **WHEN** the viewer is the owner and selects a book in grid view
- **THEN** a modal opens showing the book's full details and the actions: change status, edit, recommend, delete

#### Scenario: Friend opens someone else's book
- **WHEN** the viewer is not the owner and selects a book in grid view
- **THEN** a modal opens showing the book's full details and the actions: add to my shelf
- **AND** destructive and ownership-scoped actions are NOT shown

#### Scenario: Close on backdrop click
- **WHEN** the modal is open and the viewer clicks outside the modal panel
- **THEN** the modal closes

#### Scenario: Close on Esc
- **WHEN** the modal is open and the viewer presses the `Esc` key
- **THEN** the modal closes
