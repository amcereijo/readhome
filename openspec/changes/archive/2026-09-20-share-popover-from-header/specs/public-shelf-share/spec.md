## MODIFIED Requirements

### Requirement: Owner mints a public share token

The system SHALL let the owner mint a public share token from a popover anchored to the header `Share` control. The owner&apos;s shelf page SHALL NOT render an inline share card. Minting creates an unguessable token (UUID) on the owner&apos;s `users` row and enables public sharing. The system SHALL display the resulting public URL inside the popover after minting. The header `Share` control SHALL be visible only to the owner, SHALL carry a localized tooltip explaining its purpose, and SHALL display a localized indicator (for example, a colored dot) when sharing is currently enabled and no indicator when sharing is disabled. The popover SHALL open on activation of the control and SHALL close on outside click and on the `Escape` key.

#### Scenario: Owner enables sharing for the first time
- **WHEN** the owner opens their shelf and has not yet minted a share token
- **THEN** the header `Share` control renders without the on-indicator
- **WHEN** the owner activates the header `Share` control
- **THEN** the popover opens
- **AND** the popover shows a `Create share link` action
- **AND** no public URL is shown

#### Scenario: Owner mints the link
- **WHEN** the owner activates `Create share link` inside the popover
- **THEN** the system stores a UUID token on the owner&apos;s row and marks sharing enabled
- **AND** the popover shows the full public URL in a copyable form
- **AND** the popover surfaces a localized notice that anyone with the link can view the shelf
- **AND** the header `Share` control renders the on-indicator

#### Scenario: Non-owner never sees the panel
- **WHEN** any visitor who is not the owner views any page
- **THEN** the header `Share` control is not rendered
- **AND** no share popover is rendered

#### Scenario: Owner reaches the share panel from the header
- **WHEN** the owner activates the header `Share` control
- **THEN** the popover opens anchored to the control
- **AND** the popover is the single source of truth for minting, rotating, and disabling

#### Scenario: Header Share control carries a localized tooltip
- **WHEN** the owner views the shelf header
- **THEN** the `Share` control exposes a localized tooltip in the active locale
- **AND** the indicator&apos;s accessible label is localized in the active locale

#### Scenario: Owner closes the popover
- **WHEN** the popover is open and the owner presses the `Escape` key
- **OR** the owner clicks outside the popover
- **THEN** the popover closes

### Requirement: Owner can rotate the share token

The system SHALL let the owner rotate their share token. Rotation SHALL replace the stored token with a new UUID and SHALL leave `public_shelf_enabled` unchanged. Any prior URL that used the old token SHALL stop resolving and SHALL return a not-found response immediately after rotation.

#### Scenario: Owner rotates the link
- **WHEN** the owner activates `Rotate link` inside the popover while sharing is enabled
- **THEN** the system replaces the stored token with a new UUID
- **AND** sharing remains enabled
- **AND** the popover shows the new public URL
- **AND** the previously shared URL no longer resolves

#### Scenario: Rotating does not delete the shelf
- **WHEN** the owner rotates their share token
- **THEN** every book on the shelf is unchanged
- **AND** the books remain on the owner&apos;s shelf view

### Requirement: Owner can disable sharing

The system SHALL let the owner disable public sharing. Disabling SHALL set `public_shelf_enabled` to false on the owner&apos;s row and SHALL clear the stored token. While disabled, the previously shared URL SHALL return a not-found response. The owner&apos;s shelf and every other view of it SHALL remain unchanged.

#### Scenario: Owner disables sharing
- **WHEN** the owner activates `Disable sharing` inside the popover while sharing is enabled
- **THEN** the system clears the stored token and marks sharing disabled
- **AND** the previously shared URL returns a not-found response
- **AND** the owner&apos;s own shelf still lists every book
- **AND** the header `Share` control no longer renders the on-indicator

#### Scenario: Owner re-enables sharing
- **WHEN** the owner activates `Create share link` inside the popover while sharing is disabled
- **THEN** the system mints a new UUID token and marks sharing enabled
- **AND** the popover shows the new public URL
- **AND** the header `Share` control renders the on-indicator
