## Purpose

The game's 2D interface components with no parity-page screen yet: each given a fixture and a reference, then approved.

## Requirements

### Requirement: Each of the game's 2D interface components

Each of the game's 2D interface components SHALL be given a fixture and a reference before it is approved.

#### Scenario: A component with no fixture or reference is not approved

- **GIVEN** an interface component has no fixture or no reference
- **WHEN** approval is considered
- **THEN** the component is not approved

### Requirement: The forge screen's Materials tab

The forge screen's Materials tab SHALL be approved only once its frame scores within the global default difference bar.

#### Scenario: A forge frame above the bar stays unapproved

- **GIVEN** the Materials tab is compared against its reference frame
- **WHEN** its perceptual difference score is above the global default bar
- **THEN** the tab stays unapproved
