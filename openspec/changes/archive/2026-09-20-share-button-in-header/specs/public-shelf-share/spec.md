## MODIFIED Requirements

### Requirement: Owner mints a public share token

The system SHALL let the owner mint a public share token from a panel on their shelf page. Minting creates an unguessable token (UUID) on the owner&apos;s `users` row and enables public sharing. The system SHALL display the resulting public URL after minting. The owner&apos;s share panel SHALL be visible only to the owner. The owner&apos;s shelf header SHALL also expose a `Share` control that scrolls the owner to the share panel; the control SHALL carry a localized tooltip explaining its purpose, and SHALL be visible only to the owner.

#### Scenario: Owner enables sharing for the first time
- **WHEN** the owner opens their shelf and has not yet minted a share token
- **THEN** the share panel shows a `Create share link` action
- **AND** no public URL is shown

#### Scenario: Owner mints the link
- **WHEN** the owner activates `Create share link`
- **THEN** the system stores a UUID token on the owner&apos;s row and marks sharing enabled
- **AND** the panel shows the full public URL in a copyable form
- **AND** the panel surfaces a localized notice that anyone with the link can view the shelf

#### Scenario: Non-owner never sees the panel
- **WHEN** any visitor who is not the owner views any page
- **THEN** the share panel is not rendered
- **AND** the header `Share` control is not rendered

#### Scenario: Owner reaches the share panel from the header
- **WHEN** the owner activates the header `Share` control
- **THEN** the page scrolls to the share panel
- **AND** the share panel remains the single source of truth for minting, rotating, and disabling

#### Scenario: Header Share control carries a localized tooltip
- **WHEN** the owner views the shelf header
- **THEN** the `Share` control exposes a localized tooltip in the active locale
- **AND** the tooltip explains that activating it opens the share panel
