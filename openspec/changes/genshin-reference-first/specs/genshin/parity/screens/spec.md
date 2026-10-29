## ADDED Requirements

### Requirement: Every screen is referenced or named pending

Every component folder named `Screen` SHALL either carry a fixture with a reference entry or appear in the pending list of screens awaiting a reference.

#### Scenario: Screen folder with a fixture and a reference

- **GIVEN** a `Screen` folder with an `Index.fixture.ts` and a reference entry
- **WHEN** the coverage test runs
- **THEN** the screen is covered and is not listed as pending

#### Scenario: Screen folder with neither a fixture nor a pending entry

- **GIVEN** a `Screen` folder with no fixture and no pending entry
- **WHEN** the coverage test runs
- **THEN** the run fails and names the folder

### Requirement: A screen gains its fixture only once its reference is recorded

A fixture SHALL exist only for a screen with a reference entry, so the first render of a screen is already compared against the game.

#### Scenario: Fixture added without a reference

- **GIVEN** a fixture whose screen has no reference entry
- **WHEN** the reference test runs
- **THEN** the run fails and names the screen
