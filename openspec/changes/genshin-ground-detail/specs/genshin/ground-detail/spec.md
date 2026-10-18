## ADDED Requirements

### Requirement: A surface's detail is drawn at its texture's own scale

The ground's surfaces SHALL draw their detail at the metres their own texture spans per texel, not at one shared scale for every texture.

#### Scenario: A base-map surface's detail reads at its texture's texel size

- **GIVEN** a flat surface is textured by a base map of 2 metres per texel
- **WHEN** the player looks at the surface from close range
- **THEN** its detail is drawn at 2 metres per texel
- **AND** it is not drawn 50 times finer

#### Scenario: A plant dome's detail reads at its own texture's scale

- **GIVEN** a plant dome is textured by its own texture
- **WHEN** the player looks at the dome from close range
- **THEN** its detail is drawn at the metres its texture spans per texel

### Requirement: The ground's detail comes from its layers' textures

The ground SHALL draw its detail from each splat layer's own texture, tiled at that layer's repeat, and SHALL NOT draw detail from its base map.

#### Scenario: A splat layer's texture repeats at the tile's repeat

- **GIVEN** a splat layer whose tile gives it a repeat of 8 metres
- **WHEN** the player looks at ground painted by that layer
- **THEN** the layer's texture repeats every 8 metres across the ground

#### Scenario: The base map adds no detail of its own to the ground

- **GIVEN** the ground's base map is drawn beneath its layers
- **WHEN** the player looks at the ground
- **THEN** the base map's texel pattern is not visible as detail

### Requirement: Windrise's ground blends its layers' detail by their weights

Windrise's ground SHALL draw each layer's detail on the terrain in proportion to the layers' weights at each point.

#### Scenario: A terrain point blends its layers' detail by their weights

- **GIVEN** a terrain point where two layers hold different weights
- **WHEN** the terrain is drawn at that point
- **THEN** the detail shown at the point comes from both layers in proportion to their weights

### Requirement: Each other region's ground is built in its own layers

Each other region's ground SHALL draw its own layers' detail, once that region's base maps are exported.

#### Scenario: A region's ground shows its own layers' detail

- **GIVEN** a region whose base maps are exported
- **WHEN** the player looks at the region's ground
- **THEN** the ground's detail comes from that region's own splat layers
