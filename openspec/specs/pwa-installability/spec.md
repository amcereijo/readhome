## Purpose

Makes the app installable from mobile browsers by providing the registered service worker with a fetch handler that Chrome on Android and Samsung Internet require before offering install, while never serving authenticated content from cache.

## Requirements

### Requirement: Service worker registration

The application SHALL register a service worker on every page load in browsers that support the Service Worker API, and MUST degrade silently (no user-visible error or broken functionality) where registration is unsupported or fails.

#### Scenario: Supported browser registers successfully

- **WHEN** a user loads any page in a browser that supports service workers
- **THEN** the app registers its service worker and the worker reaches the activated state without user interaction

#### Scenario: Unsupported or failed registration

- **WHEN** the browser does not support the Service Worker API, or registration fails for any reason
- **THEN** the page continues to function normally with no visible error to the user

### Requirement: Mobile installability criteria are met

The application MUST satisfy the browser installability checks that mobile browsers enforce for prompting installation, so that Chrome on Android and Samsung Internet offer an install action for the app.

#### Scenario: Android install prompt is offered

- **WHEN** a user visits the app in Chrome on Android
- **THEN** the browser recognizes the app as installable and offers an install action (menu "Add to Home screen" installs as an app, not as a shortcut)

#### Scenario: Installed app launches standalone

- **WHEN** a user launches the app from the home screen after installing
- **THEN** the app opens in standalone display mode without browser UI

### Requirement: No authenticated or private content is served from cache

The service worker MUST NOT serve cached responses for navigations, API requests, or any authenticated content; such requests SHALL always hit the network, and the service worker MUST NOT cache responses containing user-private data.

#### Scenario: Private page always served from network

- **WHEN** an authenticated user navigates to a private page (e.g., their shelf) and the network is available
- **THEN** the response always comes from the network, never from service worker cache

#### Scenario: Auth and API traffic is not intercepted

- **WHEN** the browser issues requests to API routes or the authentication provider's proxy routes
- **THEN** the service worker does not intercept, cache, or modify those requests

### Requirement: Service worker updates cleanly

When a new service worker version is deployed, the previous version's runtime resources MUST be cleaned up on activation, and existing open pages MUST NOT break during the version transition.

#### Scenario: Version upgrade cleans up old resources

- **WHEN** a deployment ships a changed service worker and a client next loads a page
- **THEN** the new worker activates and removes the prior version's stored resources without breaking open pages
