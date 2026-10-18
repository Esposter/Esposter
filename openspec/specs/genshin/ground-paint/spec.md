## Purpose

The ground's colour painted in layers, as the game's terrain blends its own — grass, bare earth, sand, snow, path and rock. Where they lie is a field of each layer's shares fitted from the layer the game's tiles paint each four-metre cell in, since the game places its layers by cell and never by slope; a rule of the slope, the height or a path's distance lays a layer over the field only where a biome has one. The layers' weights are solved per vertex in the terrain's worker, as the game holds its weights per texel, so the colour the ground morphs toward at the next level is painted the same way.

## Requirements

### Requirement: The ground is painted in weighted layers

The ground SHALL be painted in layers of grass, bare earth, sand, snow, path and rock, each blended by its weight at every point, with the weights summing to one.

#### Scenario: Weights sum to one at every point

- **GIVEN** a point on the ground is painted
- **WHEN** its layers' weights are read
- **THEN** the weights sum to one

### Requirement: Layers follow the game's cell painting, not the slope

Each layer's share at a place SHALL follow the layer the game paints that cell in. A biome's slope rule MAY lay bare earth or rock over that share, where the biome has the rule; the field's own shares SHALL NOT follow the slope.

#### Scenario: Steep ground painted as grass stays grass where no slope rule applies

- **GIVEN** a steep place whose cells the game paints as grass, in a biome with no slope rule
- **WHEN** the ground is painted
- **THEN** the place is grass rather than rock

### Requirement: A biome's slope, height and path rules apply only where it has them

A biome's slope, height and path rules SHALL lay their layer over the field only where that biome has the rule, so a biome with no rule keeps its field unchanged.

#### Scenario: Windrise keeps its field with no slope rule

- **GIVEN** Windrise's ground is painted
- **WHEN** a steep slope is reached
- **THEN** no slope rule changes the field's layers

### Requirement: Each rule takes its share from the layers laid before it

Each rule SHALL take its share from the layers already laid under it, so the last layer laid wins where two overlap.

#### Scenario: Rock lies over everything on a cliff

- **GIVEN** a cliff is steep enough for a rock rule
- **WHEN** the layers are laid
- **THEN** rock covers the cliff over the layers beneath it

#### Scenario: Path lies over sand on a beach road

- **GIVEN** a beach road crosses sand
- **WHEN** the layers are laid
- **THEN** the path covers the sand along the road

### Requirement: A path is full within half its width and fades past its falloff

A path's layer SHALL be full within half the path's width and SHALL fade out to none past its falloff.

#### Scenario: Path is full at its centre

- **GIVEN** a point lies within half the path's width of its segment
- **WHEN** the path's share is read
- **THEN** the path's share is full

#### Scenario: Path gives nothing past its falloff

- **GIVEN** a point lies past the path's falloff from its segment
- **WHEN** the path's share is read
- **THEN** the path gives none

### Requirement: Each layer's colour varies across seeded patches

Each layer's colour SHALL turn between its two colours across patches of its scale, and the same seed SHALL give the same pattern.

#### Scenario: Same seed gives the same pattern

- **GIVEN** a ground is painted with a seed
- **WHEN** it is painted again with the same seed
- **THEN** the same patches appear in the same places

### Requirement: Weights are solved per vertex off the main thread

The layers' weights SHALL be solved per vertex in the terrain's worker, not per pixel each frame.

#### Scenario: Tile's weights are solved in the worker

- **GIVEN** a terrain tile is loaded
- **WHEN** its ground is painted
- **THEN** the weights are solved in the worker at each vertex

### Requirement: A morphing tile paints the colour its next level paints

A tile morphing to the next level SHALL morph toward the colour that level paints at the same place.

#### Scenario: Morph target matches the next level's paint

- **GIVEN** a tile is morphing to the next level of detail
- **WHEN** the morph runs
- **THEN** the colour morphs toward the colour the next level paints

### Requirement: Grass grows only where the grass layer dominates

Grass blades SHALL grow only on the grass layer, and flowers SHALL grow only where the weights are nearly all grass.

#### Scenario: Earth, rock, sand and path stay bare of blades

- **GIVEN** a point is painted as earth, rock, sand or path
- **WHEN** grass is placed
- **THEN** no grass blade grows there

#### Scenario: Flowers grow only on nearly all grass

- **GIVEN** a point's weights are nearly all grass
- **WHEN** flowers are placed
- **THEN** flowers may grow there

### Requirement: A ground's field is fitted from its tiles' cells

Each ground's layer field SHALL be fitted from its terrain tiles' cells as a grid of each layer's shares, and a place no cell reaches SHALL take its nearest reached node's shares.

#### Scenario: Place no cell reaches takes the nearest node's shares

- **GIVEN** a grid node is not reached by any cell
- **WHEN** the field is fitted
- **THEN** the node takes the shares of its nearest reached node

### Requirement: A region without exported base maps waits for its layer colours

A region whose base maps are not exported SHALL keep its layer colours unpainted until they are exported.

#### Scenario: Region without base maps has no layer colours yet

- **GIVEN** a region's base maps are not exported
- **WHEN** its layers are fitted
- **THEN** its layer colours are left unpainted until its base maps are exported
