## Purpose

Enables users to import their reading history and book data from Goodreads CSV export files into Read Home, preserving book metadata, ratings, and reading dates.

## Requirements

### Requirement: CSV file upload and parsing
The system SHALL accept CSV files in Goodreads export format and parse them into structured book data. Labels and instructions on the import page SHALL be translated according to the active locale.

#### Scenario: Valid CSV file upload
- **WHEN** user uploads a CSV file with Goodreads export format
- **THEN** system parses the file and extracts book metadata (title, author, ISBN, rating, dates, review)
- **AND** page instructions are shown in the active locale

#### Scenario: Invalid file format
- **WHEN** user uploads a file that is not a valid CSV or not in Goodreads format
- **THEN** system displays an error message in the active locale indicating the file format is invalid

### Requirement: Data field mapping
The system SHALL map Goodreads CSV columns to Read Home's book schema fields, including storing extra metadata in a flexible JSON field. The "Author" CSV column SHALL be mapped to the book's `author` property, not to `metadata`.

#### Scenario: Standard field mapping
- **WHEN** CSV contains standard Goodreads columns (Book Id, Title, Author, My Rating, Date Read, etc.)
- **THEN** system maps each column to the corresponding field in the book schema
- **AND** the "Author" column is stored in the book's `author` property

#### Scenario: Missing optional fields
- **WHEN** CSV is missing optional columns (e.g., My Review, Private Notes, Author)
- **THEN** system uses default values or null for those fields
- **AND** the `author` property is null or absent when the "Author" column is missing

#### Scenario: Extra metadata storage
- **WHEN** CSV contains fields not mapped to standard book properties (e.g., Publisher, Binding, Number of Pages, Year Published)
- **THEN** system stores those fields in the `metadata` JSON property as key-value pairs
- **AND** the "Author" field is not included in `metadata`

### Requirement: Date added preservation
The system SHALL preserve the original "Date Added" date from Goodreads imports.

#### Scenario: Date added stored
- **WHEN** a book is imported with a "Date Added" value
- **THEN** system stores the date in the `dateAdded` field of the book record

#### Scenario: Missing date added
- **WHEN** a book is imported without a "Date Added" value
- **THEN** system sets `dateAdded` to null

### Requirement: Finished date from Date Read
The system SHALL correctly populate the finishedAt field from the "Date Read" CSV column.

#### Scenario: Finished date stored
- **WHEN** a book is imported with a "Date Read" value
- **THEN** system stores the date in the `finishedAt` field of the book record

#### Scenario: No finished date
- **WHEN** a book is imported without a "Date Read" value
- **THEN** system sets `finishedAt` to null

### Requirement: Duplicate detection
The system SHALL detect and handle duplicate books during import.

#### Scenario: Duplicate book by ISBN
- **WHEN** imported book has an ISBN that already exists in the system
- **THEN** system skips the duplicate and reports it in import summary

#### Scenario: Duplicate book by title and author
- **WHEN** imported book has matching title and author but different ISBN
- **THEN** system flags it as potential duplicate for user review

### Requirement: Import progress feedback
The system SHALL provide feedback during the import process. All feedback text SHALL be translated according to the active locale.

#### Scenario: Import progress display
- **WHEN** import is in progress
- **THEN** system shows progress indicator with count of processed books
- **AND** the indicator text is shown in the active locale

#### Scenario: Import completion summary
- **WHEN** import completes
- **THEN** system displays summary with total imported, skipped, and error counts
- **AND** the summary labels are shown in the active locale