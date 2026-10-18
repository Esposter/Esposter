## ADDED Requirements

### Requirement: Each placed plant stands at its recorded place

Every tree, bush, rock and flower the game places SHALL stand at its recorded place, turn and scale, and the oak SHALL stand only as its landmark.

#### Scenario: A placed tree stands where the game places it

- **GIVEN** a tree the game places at a recorded place, turn and scale
- **WHEN** the player walks to the tree
- **THEN** the tree stands at that place, turn and scale

#### Scenario: The oak stands only as its landmark

- **GIVEN** the oak of Windrise
- **WHEN** the plants of the area are drawn
- **THEN** the oak is drawn once, as its landmark, and not as a scattered plant

### Requirement: A tree shows its mesh near and its impostor far

A tree SHALL show its full mesh near the eye and its impostor far from it.

#### Scenario: A far tree shows its impostor

- **GIVEN** a tree the player has walked away from
- **WHEN** the tree is far from the player's eye
- **THEN** the tree is drawn as its impostor

### Requirement: Plants out of view are not drawn

Grass, scatter and trees out of the view or past the draw distance SHALL NOT be drawn.

#### Scenario: Grass out of view is not drawn

- **GIVEN** a field of grass the player is looking away from
- **WHEN** the frame is drawn
- **THEN** the grass out of view is not drawn

### Requirement: Grass bends away from the character as it passes

Grass SHALL bend away from the character as the character walks through it.

#### Scenario: Grass bends where the character walks

- **GIVEN** a field of grass with the character walking through it
- **WHEN** the character passes through the grass
- **THEN** the blades bend away from the character

### Requirement: A trail around the viewer records the character's passage

Grass SHALL bend only where a trail around the character records its passage, and the trail SHALL follow the character as it moves.

#### Scenario: Grass beyond the trail stands upright

- **GIVEN** a field of grass beyond the extent of the trail around the character
- **WHEN** the frame is drawn
- **THEN** the blades there stand upright

#### Scenario: The trail follows the character

- **GIVEN** the character walking across a field of grass
- **WHEN** the frame is drawn
- **THEN** the trail is centred on the character and the grass it bends moves with it

### Requirement: Each species matches its game export

Each species drawn in the scene SHALL match its game export in its outline and colour.

#### Scenario: A fitted species matches its game export

- **GIVEN** a species drawn in the scene
- **WHEN** it is compared with its game export at the same view
- **THEN** its outline and colour match the export
