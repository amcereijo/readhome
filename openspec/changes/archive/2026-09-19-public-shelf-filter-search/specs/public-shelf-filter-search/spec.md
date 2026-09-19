## Purpose

Lets visitors narrow a public shelf by collapsing status sections and by searching for a book by title or author, without changing the read-only public shelf contract.

## ADDED Requirements

### Requirement: Visitor can collapse and expand status sections

The public shelf SHALL render a button on every status section heading that toggles the visibility of that section&apos;s book list. Sections SHALL render expanded by default. When a section is collapsed, the section heading and its count SHALL remain visible; only the book list SHALL be hidden. Activating the toggle a second time SHALL restore the section to its expanded state. The toggle&apos;s accessible label SHALL be localized to indicate the resulting action ("collapse" when expanded, "expand" when collapsed).

#### Scenario: All sections start expanded
- **WHEN** a visitor opens a public shelf
- **THEN** every non-empty status section renders with its book list visible

#### Scenario: Visitor collapses one section
- **WHEN** a visitor activates the toggle on a status section heading while that section is expanded
- **THEN** the section&apos;s book list disappears
- **AND** the section heading and count remain visible

#### Scenario: Visitor expands a collapsed section
- **WHEN** a visitor activates the toggle on a status section heading while that section is collapsed
- **THEN** the section&apos;s book list reappears

#### Scenario: Collapse state is per-section
- **WHEN** a visitor collapses one status section
- **THEN** every other status section remains in its previous state

### Requirement: Visitor can filter books by title or author

The public shelf SHALL render a search input that filters the visible books by title or author. The filter SHALL be case-insensitive and SHALL match a book whose title OR author contains the visitor&apos;s query as a substring. When the query is empty, every book that would otherwise be visible SHALL be shown. The filter SHALL apply across all status sections simultaneously and SHALL NOT remove sections from the page; collapsed sections stay collapsed and remain hidden.

#### Scenario: Empty query shows everything
- **WHEN** the search input is empty
- **THEN** the public shelf renders the same books as it does with no search input

#### Scenario: Query matches by title
- **WHEN** the visitor types a query that is a substring of a book&apos;s title
- **THEN** that book is visible
- **AND** books whose title and author do not contain the query are hidden

#### Scenario: Query matches by author
- **WHEN** the visitor types a query that is a substring of a book&apos;s author and not its title
- **THEN** that book is visible

#### Scenario: Query is case-insensitive
- **WHEN** the visitor types a query in any letter case
- **THEN** matches against stored title and author values ignore letter case

#### Scenario: No matches
- **WHEN** the visitor&apos;s query matches no book on the shelf
- **THEN** every status section renders no books
- **AND** the page renders a localized empty-state message for the search

### Requirement: Search and collapse work together

The search filter and the per-section collapse state SHALL operate independently. Collapsing a section while a query is active SHALL hide the section&apos;s (already-filtered) book list. The query SHALL NOT auto-expand collapsed sections; collapsing is the visitor&apos;s explicit choice and SHALL persist across query changes for the duration of the page view.

#### Scenario: Search does not auto-expand
- **WHEN** a section is collapsed and the visitor types a query that matches books in other sections
- **THEN** the collapsed section remains collapsed

#### Scenario: Search persists across collapse
- **WHEN** the visitor types a query and then collapses a different section
- **THEN** the query remains in the search input
- **AND** the books matched by the query in non-collapsed sections remain visible

### Requirement: Search and section controls are localized

The search input placeholder, the search input&apos;s accessible label, the per-section collapse and expand accessible labels, and the no-matches message SHALL be rendered in the active locale.

#### Scenario: All new strings respect the locale
- **WHEN** a visitor opens the public shelf with a locale preference of `es`
- **THEN** every visible string on the search input and on the section toggles is rendered in Spanish
