## ADDED Requirements

### Requirement: An approved image carries no platform segment

Each screen and each of its variants SHALL have one approved image beside its component, named by the screen and the variant alone, whichever machine approves it.

#### Scenario: Image name on a Windows machine

- **GIVEN** a screen approved on a Windows machine
- **WHEN** its image is named
- **THEN** the file is `Index.png`, not `Index.win32.png`

#### Scenario: Image name on a macOS machine

- **GIVEN** a screen approved on a macOS machine
- **WHEN** its image is named
- **THEN** the file is `Index.png`, not `Index.darwin.png`

#### Scenario: Two approved images for one screen

- **GIVEN** a screen with more than one approved image
- **WHEN** the visual suite resolves its image
- **THEN** the run fails and names the screen

### Requirement: Every reference the parity run compares is a screenshot

A reference SHALL be a screenshot of the game that the parity folder holds, so no comparison reads a recording.

#### Scenario: Reference is a screenshot the parity folder holds

- **GIVEN** a reference entry whose image is a screenshot held in the parity folder
- **WHEN** the reference map is typechecked
- **THEN** the entry is accepted

#### Scenario: Reference reads a recording

- **GIVEN** a reference entry that names a recording to read
- **WHEN** the reference map is typechecked
- **THEN** typecheck fails and names the entry

### Requirement: A subscreen's image is written whatever its own compare scores

A subscreen's approved image SHALL be written beside its component whatever its own compare scores, and the score's status against the bar SHALL be printed with it, so the score is a report and not a gate.

#### Scenario: Compare clears the bar

- **GIVEN** a subscreen whose compare clears the bar
- **WHEN** approval runs
- **THEN** its image is written beside its component under its own name, and its status against the bar is printed as within it

#### Scenario: Compare does not clear the bar

- **GIVEN** a subscreen whose compare does not clear the bar
- **WHEN** approval runs
- **THEN** its image is written beside its component under its own name, and its status against the bar is printed as over it

#### Scenario: Render drifts from its approved image

- **GIVEN** a subscreen whose render no longer matches its approved image
- **WHEN** the visual suite runs
- **THEN** the subscreen is listed after the run's cases, worst first, and the run passes
