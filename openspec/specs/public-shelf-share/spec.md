# public-shelf-share Specification

## Purpose
Lets an owner mint a per-user shareable URL that exposes their shelf to any visitor without an account, while keeping full control over who can read it through a single token they can rotate or disable.

## Requirements

### Requirement: Owner mints a public share token

The system SHALL let the owner mint a public share token from a popover anchored to the header `Share` control. The owner&apos;s shelf page SHALL NOT render an inline share card. Minting creates an unguessable token (UUID) on the owner&apos;s `users` row and enables public sharing. The system SHALL display the resulting public URL inside the popover after minting. The header `Share` control SHALL be visible only to the owner, SHALL carry a localized tooltip explaining its purpose, and SHALL display a localized indicator (for example, a colored dot) when sharing is currently enabled and no indicator when sharing is disabled. The popover SHALL open on activation of the control and SHALL close on outside click and on the `Escape` key.

#### Scenario: Owner enables sharing for the first time
- **WHEN** the owner opens their shelf and has not yet minted a share token
- **THEN** the header `Share` control renders without the on-indicator
- **WHEN** the owner activates the header `Share` control
- **THEN** the popover opens
- **AND** the popover shows a `Create share link` action
- **AND** no public URL is shown

#### Scenario: Owner mints the link
- **WHEN** the owner activates `Create share link` inside the popover
- **THEN** the system stores a UUID token on the owner&apos;s row and marks sharing enabled
- **AND** the popover shows the full public URL in a copyable form
- **AND** the popover surfaces a localized notice that anyone with the link can view the shelf
- **AND** the header `Share` control renders the on-indicator

#### Scenario: Non-owner never sees the panel
- **WHEN** any visitor who is not the owner views any page
- **THEN** the header `Share` control is not rendered
- **AND** no share popover is rendered

#### Scenario: Owner reaches the share panel from the header
- **WHEN** the owner activates the header `Share` control
- **THEN** the popover opens anchored to the control
- **AND** the popover is the single source of truth for minting, rotating, and disabling

#### Scenario: Header Share control carries a localized tooltip
- **WHEN** the owner views the shelf header
- **THEN** the `Share` control exposes a localized tooltip in the active locale
- **AND** the indicator&apos;s accessible label is localized in the active locale

#### Scenario: Owner closes the popover
- **WHEN** the popover is open and the owner presses the `Escape` key
- **OR** the owner clicks outside the popover
- **THEN** the popover closes

### Requirement: Public URL resolves to a read-only shelf view

The system SHALL resolve `/share/[token]` to the owner&apos;s shelf when the token matches a row whose `public_shelf_enabled` is true. The page SHALL be reachable without authentication. The system SHALL NOT resolve the route when the token does not exist or sharing has been disabled, and SHALL return a not-found response in those cases.

#### Scenario: Valid token shows the shelf
- **WHEN** a visitor opens `/share/<valid-token>` and the owner has sharing enabled
- **THEN** the system renders the owner&apos;s full shelf
- **AND** no authentication is required

#### Scenario: Disabled sharing yields a 404
- **WHEN** a visitor opens `/share/<token>` and the owner has disabled sharing
- **THEN** the system returns a not-found response

#### Scenario: Unknown token yields a 404
- **WHEN** a visitor opens `/share/<token-that-does-not-exist>`
- **THEN** the system returns a not-found response

### Requirement: Owner can rotate the share token

The system SHALL let the owner rotate their share token. Rotation SHALL replace the stored token with a new UUID and SHALL leave `public_shelf_enabled` unchanged. Any prior URL that used the old token SHALL stop resolving and SHALL return a not-found response immediately after rotation.

#### Scenario: Owner rotates the link
- **WHEN** the owner activates `Rotate link` inside the popover while sharing is enabled
- **THEN** the system replaces the stored token with a new UUID
- **AND** sharing remains enabled
- **AND** the popover shows the new public URL
- **AND** the previously shared URL no longer resolves

#### Scenario: Rotating does not delete the shelf
- **WHEN** the owner rotates their share token
- **THEN** every book on the shelf is unchanged
- **AND** the books remain on the owner&apos;s shelf view

### Requirement: Owner can disable sharing

The system SHALL let the owner disable public sharing. Disabling SHALL set `public_shelf_enabled` to false on the owner&apos;s row and SHALL clear the stored token. While disabled, the previously shared URL SHALL return a not-found response. The owner&apos;s shelf and every other view of it SHALL remain unchanged.

#### Scenario: Owner disables sharing
- **WHEN** the owner activates `Disable sharing` inside the popover while sharing is enabled
- **THEN** the system clears the stored token and marks sharing disabled
- **AND** the previously shared URL returns a not-found response
- **AND** the owner&apos;s own shelf still lists every book
- **AND** the header `Share` control no longer renders the on-indicator

#### Scenario: Owner re-enables sharing
- **WHEN** the owner activates `Create share link` inside the popover while sharing is disabled
- **THEN** the system mints a new UUID token and marks sharing enabled
- **AND** the popover shows the new public URL
- **AND** the header `Share` control renders the on-indicator

### Requirement: Public shelf lists every book grouped by status

The public shelf page SHALL list every book the owner has on their shelf, grouped by status into four sections in this order: `to-read`, `reading`, `read`, `abandoned`. Empty status sections SHALL be omitted. Each section SHALL show the localized status label as a heading and a localized count of books in that section. Books within a section SHALL be sorted by date added, newest first.

#### Scenario: Every book is listed exactly once
- **WHEN** a visitor opens a valid public shelf
- **THEN** every book on the owner&apos;s shelf appears under the section matching its status
- **AND** no book is repeated across sections

#### Scenario: Empty statuses are hidden
- **WHEN** a valid public shelf has zero books in one or more statuses
- **THEN** those statuses do not appear as sections on the page

#### Scenario: Sections render in canonical order
- **WHEN** a valid public shelf has books in multiple statuses
- **THEN** the sections appear in the order `to-read`, `reading`, `read`, `abandoned`

#### Scenario: Empty shelf
- **WHEN** a valid public shelf has zero books overall
- **THEN** the page renders an empty-state message in the active locale

### Requirement: Public book entry shows title, author, status, formats, dates, note, cover

Each book entry on the public shelf SHALL display, in the active locale: title; author when present; the status; the formats list when present; the date added; the started date when present; the finished date when present; the abandoned date when present; the note when present; and the cover thumbnail (or the localized cover placeholder when no cover URL is set).

#### Scenario: Full fields when present
- **WHEN** a public shelf entry has a title, author, status, formats, every date, a note, and a cover URL
- **THEN** the entry renders all of those fields, each labeled in the active locale

#### Scenario: Optional fields are hidden when absent
- **WHEN** a public shelf entry has no author, no formats, no started/finished/abandoned date, and no note
- **THEN** those fields are not rendered
- **AND** the title, status, and date added still render

#### Scenario: Cover placeholder when cover is missing
- **WHEN** a public shelf entry has no cover URL
- **THEN** the cover slot renders the localized placeholder

### Requirement: Public shelf hides metadata and any edit actions

The public shelf SHALL NOT render the `metadata` JSON blob for any book, and SHALL NOT render any owner-only or friend-only actions (change status, edit, delete, recommend, add to my shelf, show-details toggle, sort selector, view-mode toggle). The public shelf page SHALL be read-only.

#### Scenario: Metadata is never shown publicly
- **WHEN** a public shelf entry has values stored under `metadata`
- **THEN** no key or value from `metadata` is rendered

#### Scenario: No mutation actions on the public view
- **WHEN** a visitor views any entry on a public shelf
- **THEN** no button, link, or form on that entry can change a book, the owner&apos;s account, or the visitor&apos;s account

### Requirement: Public shelf shows a sign-up call to action for signed-out visitors

When the visitor viewing the public shelf is not signed in, the page SHALL display a localized call to action inviting them to sign up. The call to action SHALL link to `/sign-up`. Signed-in visitors viewing a public shelf SHALL NOT see this call to action.

#### Scenario: Signed-out visitor sees the call to action
- **WHEN** a visitor who is not signed in opens a valid public shelf
- **THEN** the page renders a localized sign-up prompt that links to `/sign-up`

#### Scenario: Signed-in visitor does not see the call to action
- **WHEN** a visitor who is signed in opens a valid public shelf
- **THEN** the page does not render the sign-up prompt

### Requirement: Public shelf is localized

The public shelf page and the owner&apos;s share panel SHALL render every label, button, status, count, call to action, and notice in the active locale. The public route SHALL respect the same locale resolution as the rest of the app.

#### Scenario: Locale propagates to the public page
- **WHEN** a visitor opens a valid public shelf with a locale preference of `es`
- **THEN** every visible string on the page is rendered in Spanish

#### Scenario: Owner panel is localized
- **WHEN** the owner opens their shelf with a locale preference of `es`
- **THEN** every visible string in the share panel is rendered in Spanish

### Requirement: Public shelf route is reachable without authentication

The system SHALL treat `/share/[token]` as a public route. Visiting the route SHALL NOT trigger a sign-in redirect, regardless of whether the visitor is signed in, signed out, or has a Clerk session cookie.

#### Scenario: Signed-out visitor reaches the public page
- **WHEN** a visitor who is not signed in opens `/share/<valid-token>`
- **THEN** the system renders the shelf without redirecting to `/sign-in`

#### Scenario: Signed-in visitor reaches the public page
- **WHEN** a visitor who is signed in opens `/share/<valid-token>`
- **THEN** the system renders the shelf without redirecting
