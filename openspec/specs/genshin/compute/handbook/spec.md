## Purpose

The adventurer handbook's runs: its experience page compared over the whole frame.

## Requirements

### Requirement: The adventurer handbook's experience page

The adventurer handbook's experience page SHALL be compared over its whole frame, its score reported against the global default difference bar, and its image written by approve.

#### Scenario: An experience page above the bar still gets its image

- **GIVEN** the experience page's whole frame is compared against its reference
- **WHEN** its perceptual difference score is above the global default bar
- **THEN** the score is reported over the bar, and the page's image is still written

### Requirement: The experience page's reward tiles

The experience page's reward tiles SHALL show each reward in its rarity's colour.

#### Scenario: A reward tile takes its rarity's colour

- **GIVEN** the experience page shows a reward of a given rarity
- **WHEN** its tile is drawn
- **THEN** the tile takes that rarity's colour
