# architecture/about-globe Specification

## Purpose

The About page's globe: what it draws, how it keeps its frame rate, and when it stands still.

## Requirements

### Requirement: Land is drawn where a mask says there is land

The globe SHALL draw a dot at each place on its latitude rings where the land mask says land, and nowhere else.

#### Scenario: Dots stand on land only

- **GIVEN** a land mask with one land cell
- **WHEN** the land dots are built
- **THEN** every dot lies inside that cell

### Requirement: An arc rises to its altitude

An arc SHALL run from its start to its end along a curve that peaks at its altitude above the surface.

#### Scenario: An arc peaks at its altitude

- **GIVEN** an arc with an altitude
- **WHEN** its curve is built
- **THEN** its highest point sits at that altitude above the surface

### Requirement: Quality steps down when the frame rate cannot hold

The globe SHALL move to the next quality tier when the mean frame rate over the last fifty frames is under the target, and never move up.

#### Scenario: A slow run lowers the tier

- **GIVEN** fifty frames slower than the target
- **WHEN** the watcher reads them
- **THEN** it reports the next tier

#### Scenario: A fast run keeps the tier

- **GIVEN** fifty frames faster than the target
- **WHEN** the watcher reads them
- **THEN** it reports the same tier

### Requirement: The globe starts turned to the reader's timezone

The globe SHALL start rotated by the reader's timezone offset, so the reader's side of the world faces them.

#### Scenario: A reader in Greenwich starts at the base rotation

- **GIVEN** a reader whose timezone offset is zero
- **WHEN** the start rotation is read
- **THEN** it is the base rotation

### Requirement: The globe stops when it cannot be seen or must not move

The globe SHALL stop drawing while it is off screen and SHALL draw one still frame when the reader asks for reduced motion.

#### Scenario: Reduced motion draws a still frame

- **GIVEN** a reader who asks for reduced motion
- **WHEN** the globe mounts
- **THEN** it draws one frame and starts no loop
