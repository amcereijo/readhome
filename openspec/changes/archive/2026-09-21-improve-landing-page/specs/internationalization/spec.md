## MODIFIED Requirements

### Requirement: Bilingual support
The system SHALL render all user-facing copy in the visitor's selected locale, with English (`en`) and Spanish (`es`) as the supported locales. The active locale SHALL persist via cookie and default from `Accept-Language`. URL paths SHALL NOT change between locales.

#### Scenario: New locale-keyed content is fully translated
- **WHEN** new visible copy is added to the landing page (hero, feature sections, or calls to action)
- **THEN** a matching key exists in both `lib/i18n/en.json` and `lib/i18n/es.json`
- **AND** the Spanish value is a translation rather than the English fallback

#### Scenario: Locale toggle re-renders landing
- **WHEN** a visitor switches the locale using the header toggle while viewing the landing page
- **THEN** every landing-page string re-renders in the new locale without a full page reload
- **AND** the URL does not change

## ADDED Requirements

### Requirement: Landing-page content namespace
The landing-page dictionaries SHALL expose a `features` and `hero` namespace covering the redesigned landing page, with one entry per user-facing capability.

#### Scenario: Feature sections have ES translations
- **WHEN** the redesigned landing page is rendered in Spanish
- **THEN** every feature section headline and body is sourced from `landing.features.*` in `lib/i18n/es.json`
- **AND** no English text is visible
