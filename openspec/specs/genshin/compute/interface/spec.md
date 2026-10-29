## Purpose

The game's 2D interface components with no parity-page screen yet: each given a fixture and a reference, then its image written by approve.

## Requirements

### Requirement: Each of the game's 2D interface components

Each of the game's 2D interface components SHALL be given a fixture and a reference before its image is written.

#### Scenario: A component with no fixture or reference gets no image

- **GIVEN** an interface component has no fixture or no reference
- **WHEN** its score is considered
- **THEN** the component gets no image

### Requirement: The forge screen's Materials tab

The forge screen's Materials tab SHALL be compared over its frame, its score reported against the global default difference bar, and its image written by approve.

#### Scenario: A forge frame above the bar still gets its image

- **GIVEN** the Materials tab is compared against its reference frame
- **WHEN** its perceptual difference score is above the global default bar
- **THEN** the score is reported over the bar, and the tab's image is still written
