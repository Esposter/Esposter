## Purpose

The official map's fleeing birds and beasts, the White Pigeon, the Crimson Fox and the Squirrel, fitted into each region's slice of the game data and stood in Windrise's scene, each running from the character when it comes within its escape radius. Striking them, their drops and the material sources wait on the proposal's later steps.

## Requirements

### Requirement: Fleeing animals placed where the official map marks them

The White Pigeon, the Crimson Fox and the Squirrel SHALL be placed at the places the official map marks them on the ground of a mapped region, and no other animal SHALL be placed.

#### Scenario: Fleeing kind on the ground

- **GIVEN** the official map marks a Squirrel on the ground of a mapped region
- **WHEN** the animals are placed
- **THEN** the Squirrel is placed at its marked place

#### Scenario: Underground animal left out

- **GIVEN** the official map marks a fleeing animal on a floor below the ground
- **WHEN** the animals are placed
- **THEN** that animal is left out

#### Scenario: Animal that does not flee is left alone

- **GIVEN** the official map marks an animal that is not a fleeing kind
- **WHEN** the animals are placed
- **THEN** that animal is not placed

### Requirement: Animal runs from the character within its escape radius

An animal SHALL run straight away from the character when the character comes within four metres of it.

#### Scenario: Character comes near

- **GIVEN** an idle animal stands in Windrise's scene
- **WHEN** the character comes within four metres of it
- **THEN** the animal runs straight away from the character

#### Scenario: Escape time passes

- **GIVEN** an animal is running from the character
- **WHEN** one second has passed
- **THEN** the animal stands idle at its place
- **AND** it runs again only if the character is still within reach

#### Scenario: Character gone

- **GIVEN** an animal is running and the character has gone
- **WHEN** the animal's escape time runs out
- **THEN** the animal keeps running on its last heading until then
- **AND** it then stands idle

### Requirement: Every animal of the slice exists from the scene's load

Every animal of Mondstadt's slice SHALL exist in Windrise's scene from the scene's load.

#### Scenario: Animals present on load

- **GIVEN** Mondstadt's slice holds about a hundred animals
- **WHEN** Windrise's scene loads
- **THEN** every one of those animals is present in the scene

### Requirement: Animals carry no drops or material sources yet

Animals SHALL carry no drops and offer no material sources yet, and striking one SHALL have no effect on the world.

#### Scenario: Striking an animal

- **GIVEN** an animal stands in Windrise's scene
- **WHEN** the player strikes it
- **THEN** nothing drops from it
- **AND** no material source appears
