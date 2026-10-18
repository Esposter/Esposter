## ADDED Requirements

### Requirement: Locomotion Motion

A character's model SHALL play its standing, walking, running and sprinting motion matching the game's own clips as its body moves.

#### Scenario: the Traveler's walk cycle plays while it walks

- **GIVEN** the Traveler standing in the world
- **WHEN** the Traveler starts walking
- **THEN** the walk motion plays

#### Scenario: the Traveler's standing motion plays while it is still

- **GIVEN** the Traveler walking in the world
- **WHEN** the Traveler stops
- **THEN** the standing motion plays

### Requirement: Character Scale

A character's model SHALL stand at the height of the game's own model of that character.

#### Scenario: the Traveler's height matches the game's model

- **GIVEN** the Traveler standing in the world
- **WHEN** the Traveler's height is compared with the game's model of the Traveler
- **THEN** the two heights agree

### Requirement: Terms Shown On Choice

A party screen SHALL show a chosen character's terms and credit beside the character.

#### Scenario: a chosen character's terms show beside it

- **GIVEN** a party screen with a character chosen
- **WHEN** the player views the chosen character
- **THEN** the character's terms and credit are shown beside it
