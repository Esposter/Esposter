## Purpose

The Genius Invokation board's runs: its duel frame's recording fetched, and its board compared against it.

## Requirements

### Requirement: The Genius Invokation duel board

The Genius Invokation duel board SHALL be compared over its whole frame, its score reported against the global default difference bar, and its image written by approve.

#### Scenario: A board whose frame scores above the bar still gets its image

- **GIVEN** the duel board's whole frame is compared against its reference
- **WHEN** its perceptual difference score is above the global default bar
- **THEN** the score is reported over the bar, and the board's image is still written

### Requirement: The duel board's comparison

The duel board's comparison SHALL run only when its recording is on disk.

#### Scenario: A missing recording stops the comparison

- **GIVEN** the duel frame's recording is not on disk
- **WHEN** the comparison is run
- **THEN** the comparison does not run
