## Purpose

The login page drawn over the scene, as built: the title and its account label, the status row and progress bar, the door's prompt and the four corner buttons, each shown in the stage the login screen is in.

## Requirements

### Requirement: Buttons shown per stage

The title SHALL show its notices and exit buttons, and the door SHALL show its settings, repair, notices and exit buttons.

#### Scenario: Title stage

- **WHEN** the title stage is shown
- **THEN** the notices and exit buttons are shown

#### Scenario: Door stage

- **WHEN** the door has formed
- **THEN** the settings, repair, notices and exit buttons are shown

### Requirement: Page clips play as each stage begins

The login page SHALL play its fitted animation clips as each stage begins, the white curtain and fade in on arriving, the title's fade in and fade out on the click, and the fade into white on entering.

#### Scenario: Arriving at a stage

- **WHEN** a stage begins
- **THEN** the white curtain lifts and the page fades in

#### Scenario: Title click

- **WHEN** the player clicks the title
- **THEN** the title fades out

### Requirement: Scene fades use the interface's own white

The white the scene fades up out of and into SHALL be drawn by the interface's own pieces.

#### Scenario: Scene fades to white

- **WHEN** the scene fades to white on entering
- **THEN** the white is the interface's, not the scene's

### Requirement: Mainland client age rating

A Simplified Chinese reader SHALL see the CADPA age rating of 12 and over in the top right corner at every stage, with the build string under the CNREL prefix.

#### Scenario: Mainland reader opens the login

- **WHEN** a Simplified Chinese reader opens the login screen
- **THEN** the CADPA rating of 12 and over shows in the top right corner at every stage
