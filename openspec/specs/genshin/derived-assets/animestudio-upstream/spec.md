## Purpose

The two defects in the AnimeStudio decoder found by the macOS build, drafted as upstream issues and kept here, not filed.

## Requirements

### Requirement: Decoder defects are drafted and kept, never filed

A decoder defect found by the macOS build SHALL be drafted as an upstream issue and kept in the repository, and SHALL NOT be filed or posted anywhere.

#### Scenario: A defect is drafted and kept

- **GIVEN** a decoder defect found by the macOS build
- **WHEN** it is recorded
- **THEN** its upstream issue is drafted and kept in the repository
- **AND** nothing is filed or posted upstream

### Requirement: A defect draft gives its reproduction and the effect of its patch

Each defect draft SHALL give a reproduction and the observed output before and after the patch.

#### Scenario: A draft shows the output before and after the patch

- **GIVEN** a defect draft
- **WHEN** it is read
- **THEN** it names the game version and block that reproduce the defect
- **AND** it gives the exception and texture counts before the patch and after it

### Requirement: A cause the draft cannot confirm is marked as such

A defect draft SHALL mark any cause it has not verified as not established or as inferred, rather than claim it.

#### Scenario: An unverified cause is marked not established

- **GIVEN** a cause for a defect that has not been verified
- **WHEN** the draft is written
- **THEN** the cause is marked not established

#### Scenario: An inferred cause is marked inferred while the observed read stands

- **GIVEN** a cause inferred from generated code and a stale read that was observed
- **WHEN** the draft is written
- **THEN** the cause is marked inferred
- **AND** the observed stale read is stated as observed
