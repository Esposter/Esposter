## ADDED Requirements

### Requirement: Grass and flowering plants stand where the game plants them

Grass and flowering plants SHALL stand at the places the game plants them in each region that holds a plant record.

#### Scenario: A region's grass stands where its plant record places it

- **GIVEN** a region holds a plant record
- **WHEN** the player walks that region's ground
- **THEN** grass and flowers stand at each place the record places them

#### Scenario: A region without a plant record draws no grass

- **GIVEN** a region holds no plant record
- **WHEN** the player walks that region's ground
- **THEN** no grass or flowers are drawn on it

### Requirement: Rocks stand where the game places them

Each rock object the game places in a region SHALL stand at its placed position.

#### Scenario: A rock stands at its placed position

- **GIVEN** a region's rock record places a rock
- **WHEN** the player comes to that place
- **THEN** the rock stands there

#### Scenario: A rock the game does not place is not drawn

- **GIVEN** a place in a region where the game places no rock
- **WHEN** the player comes to that place
- **THEN** no rock stands there

### Requirement: Sumeru's ruins stand where the game places them

Each ruin the game places in Sumeru SHALL stand at its placed position. A stilt hut is not claimed by this requirement, since no mesh of the game is named for one.

#### Scenario: A ruin stands at its placed position

- **GIVEN** Sumeru's ruin record places a ruin
- **WHEN** the player comes to that place in Sumeru
- **THEN** the ruin stands there

#### Scenario: A ruin the game does not place is not drawn

- **GIVEN** a place in Sumeru where the game places no ruin
- **WHEN** the player comes to that place
- **THEN** no ruin stands there

### Requirement: Each nation's Statue of the Seven stands in its region

The Statue of the Seven of each nation SHALL stand in that nation's region at its placed position.

#### Scenario: A nation's statue stands in its region

- **GIVEN** a nation's region is loaded and its statue record places a statue
- **WHEN** the player comes to the statue's place
- **THEN** the statue stands there

#### Scenario: A nation with no statue record draws no statue

- **GIVEN** a nation's region holds no statue record
- **WHEN** the player comes to that region's landmarks
- **THEN** no statue stands there

### Requirement: A cloud band spreads across the sky at its measured width

Each cloud band SHALL spread across the sky at the width its reference frame measures.

#### Scenario: A cloud band spreads across the sky at its measured width

- **GIVEN** a cloud band has a measured width
- **WHEN** the player looks up at the band's hour
- **THEN** the band spreads across the sky at that width

#### Scenario: A band with no measured width is not drawn

- **GIVEN** a cloud band has no measured width
- **WHEN** the player looks up at the band's hour
- **THEN** no band is drawn for it

### Requirement: A sub-area stands on its own ground

A sub-area with a catalogued extent SHALL stand on ground derived from that extent rather than on its region's ground.

#### Scenario: A sub-area stands on its own ground

- **GIVEN** a sub-area has a catalogued extent
- **WHEN** the player enters the sub-area
- **THEN** the ground under the player is the sub-area's own

#### Scenario: A sub-area without a catalogued extent keeps its region's ground

- **GIVEN** a sub-area has no catalogued extent
- **WHEN** the player enters the sub-area
- **THEN** the ground under the player is the region's own
