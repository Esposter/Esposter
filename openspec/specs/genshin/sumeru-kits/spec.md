## Purpose

The parametric building kits of Sumeru, built in the world package from the engine's lathe and box primitives. A rainforest city of tiered terraces with a walkway on each tier and a dome on top, a stilt hut of boxes on posts, and a desert ruin that places colonnades, obelisks, stepped pyramids and half-buried halls by position. Each generator is pure and returns one merged geometry, and the rainforest city stands as Sumeru City's first landmark.

## Requirements

### Requirement: Rainforest city built as tiered terraces under a dome

The rainforest city SHALL be built as terraces that narrow tier by tier, each tier with a walkway overhanging it, topped by a dome.

#### Scenario: City tiers and walkways

- **GIVEN** the rainforest city is generated from its options
- **WHEN** it is drawn
- **THEN** each tier is narrower than the one below it
- **AND** each tier carries a walkway that overhangs it

#### Scenario: Dome on top

- **GIVEN** the rainforest city is generated from its options
- **WHEN** it is drawn
- **THEN** a dome stands on the highest tier

### Requirement: Stilt hut stands on posts under an overhanging roof

A stilt hut SHALL stand on posts above the ground, with a floor, walls and a roof that overhangs them.

#### Scenario: Hut on posts

- **GIVEN** a stilt hut is generated from its options
- **WHEN** it is drawn
- **THEN** its floor stands above the ground on posts
- **AND** its roof overhangs its walls

### Requirement: Desert ruin placed by position

A desert ruin SHALL place its colonnades, obelisks, stepped pyramids and half-buried halls at the positions it is given.

#### Scenario: Pieces at their positions

- **GIVEN** a desert ruin is generated with pieces at given positions
- **WHEN** it is drawn
- **THEN** each piece stands at its own position
- **AND** a half-buried hall rises from below the sand to its roof

### Requirement: Each building drawn as one merged geometry

Each building SHALL be drawn as one merged geometry in one material, however many pieces it is made of.

#### Scenario: One geometry per building

- **GIVEN** a building made of many pieces
- **WHEN** it is drawn
- **THEN** all of its pieces are drawn together in one material

### Requirement: Rainforest city stands in for Sumeru City's houses

The rainforest city SHALL stand in for the houses the game draws in Sumeru City, as Sumeru City's first landmark, while the other meshes Sumeru City's export holds stay undrawn until they are built.

#### Scenario: Sumeru City's first landmark

- **GIVEN** the world shows Sumeru City
- **WHEN** the city is drawn
- **THEN** the rainforest city stands where the game's houses stand

#### Scenario: Bridges and common buildings left undrawn

- **GIVEN** Sumeru City's export holds bridges, common buildings and plants
- **WHEN** the city is drawn
- **THEN** those meshes are not drawn yet
