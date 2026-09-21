## MODIFIED Requirements

### Requirement: Public landing page on home route
The system SHALL display a public landing page when a visitor opens the home route (`/`) without being signed in. The landing page SHALL present every user-facing capability described in the project's specs as its own labeled section, alongside a hero, and SHALL source all visible copy from the i18n dictionaries.

#### Scenario: Signed-out visitor opens home
- **WHEN** a visitor who is not signed in navigates to `/`
- **THEN** the system displays the landing page
- **AND** the landing page includes a hero with a short description of the app
- **AND** the landing page includes a feature section for every user-facing capability
- **AND** the landing page provides links or buttons to sign up and sign in

### Requirement: Landing page does not expose personal data
The system SHALL NOT display any user's books, shelves, or personal information on the landing page. Captured screenshots shown on the landing page SHALL be generated from a seeded fixture user and SHALL NOT contain real users' book records or images.

#### Scenario: Public landing has no shelf data
- **WHEN** a signed-out visitor views the landing page
- **THEN** the system does not query or display any book records
- **AND** any screenshot on the landing page is sourced from `public/landing/`, not from a live user query

## ADDED Requirements

### Requirement: Every user-facing feature is represented
The landing page SHALL include a section for each of the following user-facing capabilities: book search, barcode scanning, adding a book, shelf organization, status changes, reading statistics, public shelf sharing, friend invites and connections, friend shelf browsing, recommendations (sent/received), Goodreads import, language switching, and account / username management.

#### Scenario: Capability missing from landing
- **WHEN** a new user-facing capability is added to the project
- **THEN** the landing page is updated to include a labeled section for it

### Requirement: Hero reinforces the speed of adding a book
The landing page hero SHALL include copy that highlights how quickly a book can be added, referencing both title search and barcode scanning as the two supported entry paths.

#### Scenario: Hero copy mentions both add paths
- **WHEN** the hero is rendered in either locale
- **THEN** the hero copy mentions both searching by title and scanning a barcode
