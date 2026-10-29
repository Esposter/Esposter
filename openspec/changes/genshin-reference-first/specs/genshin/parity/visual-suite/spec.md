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

### Requirement: Every reference the repository compares is a screenshot it holds

A reference SHALL be a screenshot of the game kept in the repository, so no comparison reads a recording.

#### Scenario: Reference is a screenshot the repository holds

- **GIVEN** a reference entry whose image is a screenshot kept in the repository
- **WHEN** the reference test runs
- **THEN** the entry is accepted

#### Scenario: Reference reads a recording

- **GIVEN** a reference entry that names a recording to read
- **WHEN** the reference test runs
- **THEN** the run fails and names the entry

### Requirement: A subscreen's image is approved only once its own compare clears

A subscreen's approved image SHALL be written only once its own compare clears the bar, so no subscreen holds an image it does not match.

#### Scenario: Compare clears the bar

- **GIVEN** a subscreen whose compare clears the bar
- **WHEN** approval runs
- **THEN** its image is written beside its component under its own name

#### Scenario: Compare does not clear the bar

- **GIVEN** a subscreen whose compare does not clear the bar
- **WHEN** approval runs
- **THEN** no image is written and the run fails

#### Scenario: Render drifts from its approved image

- **GIVEN** a subscreen whose render no longer matches its approved image
- **WHEN** the visual suite runs
- **THEN** the run fails and names the subscreen
