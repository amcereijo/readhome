## Purpose

Generates and maintains the static image and animation assets used on the public landing page by capturing screenshots of a seeded fixture user session and packaging them into per-feature stills and short animations.

## Requirements

### Requirement: Seeded capture fixture
The system SHALL provide a deterministic capture fixture (a dedicated seeded user plus a CLI flag, env var, or temporary middleware bypass) so the capture script can render signed-in screens without bypassing authentication.

#### Scenario: Capture run against fixture
- **WHEN** the capture script is invoked with the fixture mode enabled
- **THEN** the running app renders signed-in pages as the seeded user
- **AND** no production data is read or written

#### Scenario: Capture run without fixture
- **WHEN** the capture script is invoked without fixture mode and the running app is not signed in
- **THEN** the script fails fast with a clear error rather than capturing signed-out screens

### Requirement: Reproducible capture script
The system SHALL provide a `landing.capture` npm script that boots the app, drives a headless browser to each target route in a defined viewport, and writes per-screen PNGs plus a manifest mapping each asset to its feature label and locale.

#### Scenario: Capture completes for every target route
- **WHEN** the capture script runs successfully
- **THEN** a PNG exists in `public/landing/` for each declared feature route
- **AND** `public/landing/manifest.json` lists every asset with its `feature`, `route`, `viewport`, and `alt`

#### Scenario: Capture is idempotent
- **WHEN** the capture script is run twice in a row without source changes
- **THEN** the second run overwrites the first run's files without leaving orphaned assets
- **AND** any asset no longer referenced by the manifest is removed

### Requirement: Animations derived from stills
The system SHALL produce a short looping animation (GIF or muted autoplay MP4/WebP) for at least the "add a book" and "barcode scan" features, derived from the captured stills.

#### Scenario: Add-book animation exists
- **WHEN** the capture script completes
- **THEN** `public/landing/feature-add-book.{gif,mp4,webp}` exists
- **AND** it loops automatically without sound

#### Scenario: Barcode animation exists
- **WHEN** the capture script completes
- **THEN** `public/landing/feature-barcode-scan.{gif,mp4,webp}` exists
- **AND** it loops automatically without sound

### Requirement: Capture runs in CI without leaking secrets
The capture script SHALL NOT require production credentials and SHALL refuse to run when production environment variables (e.g. `TURSO_*` pointing at production, `NEXT_PUBLIC_APP_URL` set to the deployed domain) are detected.

#### Scenario: Production env detected
- **WHEN** the capture script detects a production-shaped environment
- **THEN** the script exits with a non-zero status and a message identifying the offending variable

#### Scenario: Local capture
- **WHEN** the capture script is run against the local dev database with a seeded fixture
- **THEN** it completes without contacting any remote service
