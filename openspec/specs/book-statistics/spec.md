## Purpose

Lets the owner of a shelf see how many books they finished and how many pages they read in a given year or month, with a nudge to fill in missing page counts so totals stay accurate.

## Requirements

### Requirement: Statistics page is owner-only and locale-aware

The system SHALL provide a statistics page at `/stats` accessible only to the signed-in owner. The page SHALL be rendered in the active locale, and SHALL NOT be reachable by friends, signed-out visitors, or any other viewer.

#### Scenario: Owner opens /stats
- **WHEN** the signed-in owner navigates to `/stats`
- **THEN** the system displays the statistics page in the active locale

#### Scenario: Signed-out visitor opens /stats
- **WHEN** a visitor who is not signed in navigates to `/stats`
- **THEN** the system redirects them to sign-in

#### Scenario: Friend opens /stats
- **WHEN** a signed-in user who is not the owner navigates to `/stats`
- **THEN** the system does NOT show the owner's statistics
- **AND** the system does NOT show any statistics for that other user in this route

### Requirement: Period selector with year and month granularity

The system SHALL let the owner pick a year and, while a year is selected, a month within that year. The default selection SHALL be the current year; when a year is selected, the default month SHALL be "all months in that year". The page SHALL read the selected year and month from the URL so the view is shareable and back-button friendly.

#### Scenario: Default period is the current year
- **WHEN** the owner opens `/stats` with no period query parameters
- **THEN** the system uses the current calendar year as the selected period
- **AND** the system aggregates over all 12 months of that year

#### Scenario: Owner selects a specific month
- **WHEN** the owner chooses a month within the selected year
- **THEN** the system aggregates over only the days of that month

#### Scenario: Owner switches years
- **WHEN** the owner selects a different year
- **THEN** the system aggregates over that year
- **AND** the month selector resets to "all months in that year" unless the owner re-selects a month

### Requirement: Books finished in a period

The system SHALL report the number of finished books for the selected period. A book counts as finished in a period when its status is `read` AND its `finished_at` date falls inside the selected period. A book in status `read` with no `finished_at` SHALL NOT be counted in any period.

#### Scenario: Book finished in the selected year
- **WHEN** the selected period covers the year in which a book has `status = 'read'` and `finished_at = '<date inside that year>'`
- **THEN** the system includes that book in the books-finished count

#### Scenario: Book finished outside the selected period
- **WHEN** a book has `status = 'read'` and `finished_at` outside the selected period
- **THEN** the system does NOT include that book in the books-finished count

#### Scenario: Book in read status without a finished date
- **WHEN** a book has `status = 'read'` and `finished_at` is null
- **THEN** the system does NOT include that book in any period

#### Scenario: Book in non-read status
- **WHEN** a book has status `to-read`, `reading`, or `abandoned`
- **THEN** the system does NOT include that book in any books-finished count

### Requirement: Pages read in a period

The system SHALL report the total number of pages the owner read in the selected period by summing `metadata.pageCount` across finished books in that period that have a positive, finite `pageCount`. Books without a `pageCount` SHALL NOT contribute to the total but SHALL be reflected in the warning described below.

#### Scenario: Book with a page count
- **WHEN** a finished book in the selected period has `metadata.pageCount` as a positive number
- **THEN** the system adds that pageCount to the pages-read total

#### Scenario: Book without a page count
- **WHEN** a finished book in the selected period has no `pageCount` (null, missing, or not a positive finite number)
- **THEN** the system does NOT add to the pages-read total
- **AND** the system increments the count of books in the period without a page count

### Requirement: Warning when page counts are missing

The system SHALL display a localized warning on the statistics page when at least one finished book in the selected period lacks a usable `pageCount`. The warning SHALL state how many of the finished books in the period are missing the page count and SHALL invite the owner to fill it in so totals become more accurate. When every finished book in the period has a usable page count, the warning SHALL NOT be displayed.

#### Scenario: Some finished books lack a page count
- **WHEN** at least one finished book in the selected period lacks a usable `pageCount`
- **THEN** the system displays a warning showing the count of missing books
- **AND** the warning copy is localized to the active locale

#### Scenario: All finished books have a page count
- **WHEN** every finished book in the selected period has a usable `pageCount`
- **THEN** the system does NOT display the page-count warning

#### Scenario: No finished books in the period
- **WHEN** the selected period contains no finished books
- **THEN** the system does NOT display the page-count warning

### Requirement: Empty state

The system SHALL display a localized empty-state message when the selected period contains zero finished books. The message SHALL be shown in place of the metric values.

#### Scenario: Period with no finished books
- **WHEN** the selected period contains no books with `status = 'read'` and `finished_at` inside that period
- **THEN** the system displays the localized empty-state message instead of numeric metrics

### Requirement: Side nav exposes the statistics page

The system SHALL add a `Statistics` entry to the owner-facing side nav, positioned between `Shelf` and `Friends`. The entry SHALL link to `/stats`, SHALL be localized through the active locale, and SHALL be visible only to signed-in owners.

#### Scenario: Owner views the side nav
- **WHEN** the owner renders any signed-in page that shows the side nav
- **THEN** the nav lists `Shelf`, `Statistics`, and `Friends` in that order
- **AND** the `Statistics` entry links to `/stats`

#### Scenario: Statistics entry is active
- **WHEN** the owner is on `/stats`
- **THEN** the `Statistics` nav entry is rendered in the active state

### Requirement: Average days to read a book in a period

The system SHALL report the average number of days the owner spent reading a book in the selected period. For each finished book in the period, the system SHALL compute the span between that book's `startedAt` and `finishedAt` dates in whole days. The average SHALL be the arithmetic mean of those spans across books in the period whose `startedAt` AND `finishedAt` are both non-null AND whose span is greater than zero days. Books with no `startedAt`, with no `finishedAt`, or with `startedAt >= finishedAt` SHALL NOT contribute to the average. The average SHALL be displayed in whole days, rounded to the nearest integer.

#### Scenario: Book with both dates contributes to the average
- **WHEN** a finished book in the selected period has both `startedAt` and `finishedAt` non-null and `startedAt < finishedAt`
- **THEN** the system includes that book's span in days in the average calculation

#### Scenario: Book without a start date is excluded from the average
- **WHEN** a finished book in the selected period has `startedAt` as null
- **THEN** the system does NOT include that book in the average calculation
- **AND** the system counts that book as missing a start date for the warning described in the missing-start-date requirement

#### Scenario: Book with start equal to finish is excluded from the average
- **WHEN** a finished book in the selected period has `startedAt` equal to `finishedAt`
- **THEN** the system does NOT include that book in the average calculation

#### Scenario: Book with start after finish is excluded from the average
- **WHEN** a finished book in the selected period has `startedAt` greater than `finishedAt`
- **THEN** the system does NOT include that book in the average calculation

#### Scenario: Average is rounded to whole days
- **WHEN** the system reports the average for a period with at least one qualifying book
- **THEN** the displayed value is the arithmetic mean rounded to the nearest whole number of days

### Requirement: Footnote describing the average inclusion rule

The system SHALL display a localized footnote beneath the average-days-to-read metric that explains the metric is computed across finished books in the period with both a start date and a finish date, and that books without a start date are excluded. The footnote SHALL be shown whenever the average metric is rendered.

#### Scenario: Footnote is shown with the average metric
- **WHEN** the system renders the average-days-to-read metric with at least one qualifying book
- **THEN** the system displays a localized footnote describing the inclusion rule

### Requirement: Warning when start dates are missing

The system SHALL display a localized warning on the statistics page when at least one finished book in the selected period has a `finishedAt` but no `startedAt`. The warning SHALL state how many of the finished books in the period are missing a start date and SHALL invite the owner to add start dates so the average becomes more representative. When every finished book in the period has a `startedAt`, or when the period has zero finished books, the warning SHALL NOT be displayed.

#### Scenario: Some finished books lack a start date
- **WHEN** at least one finished book in the selected period has a non-null `finishedAt` and a null `startedAt`
- **THEN** the system displays a warning showing the count of finished books missing a start date
- **AND** the warning copy is localized to the active locale

#### Scenario: All qualifying finished books have a start date
- **WHEN** every finished book in the selected period with a `finishedAt` also has a non-null `startedAt`
- **THEN** the system does NOT display the missing-start-date warning

#### Scenario: No finished books in the period
- **WHEN** the selected period contains no finished books
- **THEN** the system does NOT display the missing-start-date warning

### Requirement: Empty state for the average metric

The system SHALL hide the average-days-to-read metric (and its footnote) when zero books qualify for the average in the selected period. The existing empty-state card for the period SHALL remain the sole message in that case.

#### Scenario: Period with no qualifying books
- **WHEN** the selected period contains zero books that meet the average inclusion rule
- **THEN** the system does NOT render the average-days-to-read card
- **AND** the system does NOT render the average footnote
