## REMOVED Requirements

### Requirement: Reference images are kept outside the repository

**Reason**: the repository now holds the screenshots each screen is judged against, and no reference is a recording frame, so the requirement's rule that the repository names a recording and a second no longer holds. The replacement below keeps the rule that a reference is not committed as a recording.

## ADDED Requirements

### Requirement: A reference is a screenshot the repository holds or a wiki file

A reference SHALL be a screenshot of the game that the repository holds beside its component, or a wiki file it names, and the repository SHALL NOT name a recording or a second of one as a reference.

#### Scenario: Reference is a screenshot the repository holds

- **GIVEN** a reference a screen is judged against
- **WHEN** the reference is recorded in the repository
- **THEN** it is a labelled screenshot held beside its component
- **AND** no recording or second of a recording is named

#### Scenario: Reference names a recording

- **GIVEN** a reference entry that names a recording or a second of one
- **WHEN** the reference test runs
- **THEN** the run fails and names the entry
