## ADDED Requirements

### Requirement: A headless package is a named Vue package

A headless package SHALL be named vue-, then what it is, then -headless, and SHALL declare Vue as a peer dependency.

#### Scenario: A package that follows the convention passes the check

- **GIVEN** a package named vue-grid-layout-headless that declares Vue as a peer
- **WHEN** the package check runs
- **THEN** the check passes

#### Scenario: A headless package without a Vue peer fails the check

- **GIVEN** a headless package that does not declare Vue as a peer
- **WHEN** the package check runs
- **THEN** the check fails and names the package

#### Scenario: A headless package with the wrong name fails the check

- **GIVEN** a headless package named headless-grid-layout
- **WHEN** the package check runs
- **THEN** the check fails and names the package

### Requirement: A headless package has one entry

A headless package SHALL export its package entry and its manifest only, so a function and a composable come from the same import.

#### Scenario: A package with a subpath export fails the check

- **GIVEN** a headless package whose exports name a subpath beside its entry
- **WHEN** the package check runs
- **THEN** the check fails and names the subpath

### Requirement: No headless package imports Pinia

A headless package SHALL NOT import Pinia, so the store library is never forced on a consumer and every store stays the app's.

#### Scenario: A package that imports Pinia fails the check

- **GIVEN** a headless package with a source file that imports Pinia
- **WHEN** the package check runs
- **THEN** the check fails and names the file
