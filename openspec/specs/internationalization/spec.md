## Purpose

Provides Spanish and English language support for all user-facing text in Read Home, with a manual toggle and locale persistence via cookie.

## Requirements

### Requirement: Supported locales
The system SHALL support two locales: `en` (English) and `es` (Spanish). All supported locales SHALL be available for selection at any time.

#### Scenario: Default locale on first visit
- **WHEN** a visitor opens the app and has no locale cookie
- **THEN** the system uses the browser's `Accept-Language` header to choose `es` if Spanish is preferred, otherwise `en`
- **AND** the system sets the chosen locale in a cookie

#### Scenario: Manual locale selection
- **WHEN** a signed-in person clicks the language toggle
- **THEN** the system switches the active locale to the other supported locale
- **AND** the system updates the cookie

### Requirement: Language toggle is always visible to signed-in users
The system SHALL display a single language toggle (`EN | ES`) in the application header when the user is signed in. The active locale SHALL be visually distinct.

#### Scenario: Toggle shows active locale
- **WHEN** the active locale is `en`
- **THEN** the toggle highlights `EN` and shows `ES` as available

#### Scenario: Toggle switches locale
- **WHEN** a signed-in person clicks `ES`
- **THEN** the system updates all user-facing text to Spanish

### Requirement: All user-facing text is translated
The system SHALL translate all user-facing text based on the active locale. This includes navigation labels, page titles, buttons, form labels, status labels, empty states, server action error messages, and landing page content. In addition, every icon-only action button SHALL have a localized `aria-label` key in the dictionary so screen readers announce the action in the active locale.

#### Scenario: Navigation in Spanish
- **WHEN** the active locale is `es`
- **THEN** the navigation shows "Estantería" and "Amigos" instead of "Shelf" and "Friends"

#### Scenario: Status labels in Spanish
- **WHEN** the active locale is `es`
- **THEN** status labels show "Por leer", "Leyendo", "Leído", and "Abandonado"

#### Scenario: Form labels in Spanish
- **WHEN** the active locale is `es`
- **THEN** form labels such as "Title", "Author", "Note", "Started", "Finished", and "Abandoned" are shown in Spanish

#### Scenario: Server action errors are translated
- **WHEN** a server action returns an error message and the active locale is `es`
- **THEN** the system displays the error message in Spanish

#### Scenario: Icon-only buttons have a localized aria-label
- **WHEN** an icon-only action button is rendered while the active locale is `es`
- **THEN** the button's `aria-label` is the Spanish value from the locale dictionary
- **AND** when the active locale is `en`, the `aria-label` is the English value

#### Scenario: New locale-keyed content is fully translated
- **WHEN** new visible copy is added to the landing page (hero, feature sections, or calls to action)
- **THEN** a matching key exists in both `lib/i18n/en.json` and `lib/i18n/es.json`
- **AND** the Spanish value is a translation rather than the English fallback

#### Scenario: Locale toggle re-renders landing
- **WHEN** a visitor switches the locale using the header toggle while viewing the landing page
- **THEN** every landing-page string re-renders in the new locale without a full page reload
- **AND** the URL does not change

### Requirement: Landing-page content namespace
The landing-page dictionaries SHALL expose a `features` and `hero` namespace covering the redesigned landing page, with one entry per user-facing capability.

#### Scenario: Feature sections have ES translations
- **WHEN** the redesigned landing page is rendered in Spanish
- **THEN** every feature section headline and body is sourced from `landing.features.*` in `lib/i18n/es.json`
- **AND** no English text is visible

### Requirement: URLs stay the same across locales
The system SHALL keep URLs unchanged when switching locales. A Spanish-speaking user and an English-speaking user SHALL share the same routes such as `/`, `/friends`, and `/reading`.

#### Scenario: Switch language on same page
- **WHEN** a user is on `/friends` and switches from `en` to `es`
- **THEN** the system remains on `/friends` and shows the page in Spanish

### Requirement: Server components render translated text
The system SHALL allow server components to render text in the active locale on the first request without requiring client-side JavaScript for language selection.

#### Scenario: First request in Spanish
- **WHEN** a request with locale cookie `es` arrives
- **THEN** server-rendered HTML contains Spanish text
