## ADDED Requirements

### Requirement: Using a food heals its own target

Using a food SHALL take one of that food from the bag and apply its heal to the target the food names, never raising a character's health past full.

#### Scenario: Using a recovery dish heals the selected character

- **GIVEN** the bag holds a recovery dish and the selected character is below full health
- **WHEN** the player uses the dish
- **THEN** one of the dish is taken from the bag
- **AND** the selected character's health rises by the dish's heal

#### Scenario: Using a party dish heals every party member

- **GIVEN** the bag holds a dish that heals the whole party and members are below full health
- **WHEN** the player uses the dish
- **THEN** one of the dish is taken from the bag
- **AND** every party member's health rises by the dish's heal

#### Scenario: A heal stops at full health

- **GIVEN** the selected character is within a dish's heal of full health
- **WHEN** the player uses the dish
- **THEN** the character's health is full
- **AND** the health does not rise past full

#### Scenario: A food with none in the bag cannot be used

- **GIVEN** the bag holds none of a food
- **WHEN** the player tries to use that food
- **THEN** the food is not used
- **AND** no health changes
