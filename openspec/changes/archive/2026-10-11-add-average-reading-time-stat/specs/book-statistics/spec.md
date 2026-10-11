## ADDED Requirements

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