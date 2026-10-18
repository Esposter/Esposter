## Purpose

A reference drawn behind an interface is compared over a clean plate, its interface region filled from the pixels around it.

## Requirements

### Requirement: An interface over a scene is compared over its clean plate

A reference drawn behind an interface SHALL be compared over a clean plate whose scored region is filled from the pixels around it, so the game's interface does not count against the screen.

#### Scenario: Backdrop reference scored

- **GIVEN** a reference drawn behind an interface
- **WHEN** the reference is scored
- **THEN** its interface region is filled from the pixels around it
- **AND** each drawn piece is scored against what lies behind it

#### Scenario: Region covering the whole frame

- **GIVEN** a reference whose scored region covers the whole frame and names no pieces to fill
- **WHEN** the reference is scored
- **THEN** its frame is scored as it stands

#### Scenario: Named pieces filled in turn

- **GIVEN** a reference whose scored region covers the whole frame and names its pieces to fill
- **WHEN** the reference is scored
- **THEN** each named piece is filled from the pixels around it in turn
- **AND** the scene between the pieces stays as the frame draws it

### Requirement: Translucent glass is coloured from the scene behind it

Translucent glass drawn over a recording SHALL be coloured from the scene around it before the screen is scored.

#### Scenario: Prompt band over a recording

- **GIVEN** a translucent prompt band drawn over a recording
- **WHEN** the screen is scored
- **THEN** the band's colour is solved from the scene around it
- **AND** the opaque pieces and their placements are scored as drawn

### Requirement: A capture is compared untagged

A captured frame SHALL be written for comparison without the colour tags its file states, so a browser does not colour-manage it a second time and draw it darker than its file.

#### Scenario: Tagged capture written untagged

- **GIVEN** a capture whose file is tagged with its gamma and primaries
- **WHEN** the frame is written for comparison
- **THEN** the frame is untagged
- **AND** its brightness matches the darkness of its file
