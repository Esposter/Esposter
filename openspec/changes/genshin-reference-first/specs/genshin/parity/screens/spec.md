## ADDED Requirements

### Requirement: Every screen folder is referenced or named pending

Every component folder named `Screen` SHALL either carry a fixture with a reference entry or appear in the pending list of screens awaiting a reference.

#### Scenario: Screen folder with a fixture and a reference

- **GIVEN** a `Screen` folder with a fixture and a reference entry
- **WHEN** the coverage test runs
- **THEN** the screen is covered and is not listed as pending

#### Scenario: Screen folder with neither a fixture nor a pending entry

- **GIVEN** a `Screen` folder with no fixture and no pending entry
- **WHEN** the coverage test runs
- **THEN** the run fails and names the folder

### Requirement: Every subscreen names a reference of its own

Every subscreen SHALL name a reference of its own, or a pending entry stating why it has none, and a subscreen that borrows another's reference is not covered.

#### Scenario: Variant with its own reference

- **GIVEN** a fixture variant with a reference entry naming that variant
- **WHEN** the reference test runs
- **THEN** the variant is covered

#### Scenario: Variant with no entry

- **GIVEN** a fixture variant with no entry naming it
- **WHEN** the reference test runs
- **THEN** the run fails and names the screen and the variant

#### Scenario: Variant borrowing its base's reference

- **GIVEN** a fixture variant whose only entry is its base screen's
- **WHEN** the reference test runs
- **THEN** the run fails and names the variant

#### Scenario: Variant pending with a reason

- **GIVEN** a fixture variant whose entry is pending and states its reason
- **WHEN** the reference test runs
- **THEN** the variant is listed as pending and the run passes

### Requirement: A screen gains its fixture only once its reference is recorded

A fixture SHALL exist only for a screen with a reference entry, so the first render of a screen is already compared against the game.

#### Scenario: Fixture added without a reference

- **GIVEN** a fixture whose screen has no reference entry
- **WHEN** the reference test runs
- **THEN** the run fails and names the screen
