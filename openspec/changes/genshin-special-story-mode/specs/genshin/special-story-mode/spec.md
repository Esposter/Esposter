## ADDED Requirements

### Requirement: A restricted step keeps the Paimon menu shut

While an active quest step is restricted, the Paimon menu SHALL NOT open, and Escape, the Start button and the Paimon menu's shortcut SHALL do nothing.

#### Scenario: A restricted step keeps the Paimon menu shut

- **GIVEN** the player is in the world and a quest's active step is restricted
- **WHEN** the player presses the Paimon menu's shortcut
- **THEN** the Paimon menu does not open

#### Scenario: A step with no restriction opens the Paimon menu

- **GIVEN** the player is in the world and no active step is restricted
- **WHEN** the player presses the Paimon menu's shortcut
- **THEN** the Paimon menu opens
