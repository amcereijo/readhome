## Purpose

Provides the layout and component primitives used by the redesigned public landing page so every user-facing capability can be presented as a hero plus a labeled screenshot section.

## Requirements

### Requirement: Landing feature section primitive
The system SHALL expose a composable `<LandingFeatureSection>` primitive that accepts a localized headline, a localized body, an image or animation source, an optional `alt` text, an optional image-side (`left`|`right`), and renders a responsive stacked-on-mobile / side-by-side-on-desktop layout.

#### Scenario: Section renders with image on the right
- **WHEN** a section is rendered with `imageSide="right"`
- **THEN** the copy column appears on the left and the image column on the right at viewport widths ≥ the `md` breakpoint
- **AND** the order reverses (image above copy) below that breakpoint

#### Scenario: Section renders without an image
- **WHEN** a section is rendered without an image source
- **THEN** the layout collapses to a single full-width copy column
- **AND** no broken-image element is rendered

### Requirement: Landing screenshot component
The system SHALL expose a `<LandingScreenshot>` primitive that accepts a `src`, `alt`, optional `type` (`image`|`gif`|`video`), and optional `priority` flag, and renders the correct element (`<img>`, `<img>`, or `<video autoplay muted loop playsInline>`) with a stable aspect ratio and a `loading` attribute consistent with Next.js image guidance.

#### Scenario: Static screenshot
- **WHEN** `type="image"` and a `src` are provided
- **THEN** the component renders an `<img>` with the provided `alt` and the project's default styling

#### Scenario: Looping animation
- **WHEN** `type="gif"` or `type="video"` is provided
- **THEN** the component renders an element that autoplays, loops, and is muted by default
- **AND** a `prefers-reduced-motion` media query pauses the animation

#### Scenario: Priority screenshot
- **WHEN** `priority` is true
- **THEN** the rendered element does not set `loading="lazy"`

### Requirement: Landing hero
The system SHALL expose a `<LandingHero>` primitive that renders the existing tagline pill, page title, and subtitle, followed by the primary/secondary call-to-action buttons, and accepts an optional hero image or animation that sits beside the copy at desktop widths.

#### Scenario: Hero with no media
- **WHEN** the hero is rendered without an image
- **THEN** it centers its copy and buttons in a single column
- **AND** the existing two call-to-action links (`/sign-up` and `/sign-in`) are present

#### Scenario: Hero with hero media
- **WHEN** the hero is rendered with a hero image
- **THEN** the image appears to the right of the copy at `md` and above
- **AND** the image stacks above the copy below `md`

### Requirement: Bilingual landing content
The system SHALL source all visible copy in the redesigned landing page from the i18n dictionaries so that every string renders in the active locale (`en` or `es`).

#### Scenario: English locale
- **WHEN** the active locale is `en`
- **THEN** every section headline and body uses the `en` value

#### Scenario: Spanish locale
- **WHEN** the active locale is `es`
- **THEN** every section headline and body uses the `es` value
- **AND** no English string is visible

### Requirement: Reduced-motion fallback
The system SHALL respect `prefers-reduced-motion: reduce` by pausing or replacing any animated asset on the landing page with its first-frame still.

#### Scenario: Reduced motion enabled
- **WHEN** a visitor has `prefers-reduced-motion: reduce` set
- **THEN** looping animations are paused or replaced with a still frame
- **AND** no autoplaying motion is visible
