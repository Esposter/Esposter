## REMOVED Requirements

### Requirement: A write waits for the server only for a reason the server alone can answer

**Reason**: A stale version no longer prompts a refresh; the requirement returns under a new name with a scenario offering the choice between versions.

**Migration**: None.

## ADDED Requirements

### Requirement: A write waits for the server only when the server alone can answer

A write SHALL wait for the server's answer before the screen changes only when what the reader sees next is a value only the server issues, an outcome the server decides, or a step that cannot be undone, and a write that carries a version token applies at once like any other.

#### Scenario: A create whose link only the server mints waits for the server

- **GIVEN** a create whose result is a link only the server mints
- **WHEN** the create is sent
- **THEN** the link appears only once the server has answered

#### Scenario: A stale version drops the save and offers the choice

- **GIVEN** a save that carries the content version it was made against, already shown on screen
- **WHEN** the server reports that version is stale
- **THEN** the save is dropped, and the screen keeps the content the reader made
- **AND** the reader is offered the other version or their own

#### Scenario: A rapid second click on a like creates only one like

- **GIVEN** a like that is already being created
- **WHEN** the reader clicks the like again
- **THEN** no second like is created
