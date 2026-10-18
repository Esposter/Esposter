## Purpose

The adventurer handbook's runs: its experience page approved over the whole frame.

## Requirements

### Requirement: The adventurer handbook's experience page

The adventurer handbook's experience page SHALL be approved only once its whole frame scores within the global default difference bar.

#### Scenario: An experience page above the bar stays unapproved

- **GIVEN** the experience page's whole frame is compared against its reference
- **WHEN** its perceptual difference score is above the global default bar
- **THEN** the page stays unapproved

### Requirement: The experience page's reward tiles

The experience page's reward tiles SHALL show each reward in its rarity's colour.

#### Scenario: A reward tile takes its rarity's colour

- **GIVEN** the experience page shows a reward of a given rarity
- **WHEN** its tile is drawn
- **THEN** the tile takes that rarity's colour
