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
