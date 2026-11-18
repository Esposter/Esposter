## Purpose

A ground's height composed in three layers, each read only where it reaches: Gaussian hills over a base, sharp features the hills smear (cliff terraces, ridges and plateaus, each blended by its own falloff), and a fine residual of simplex noise summed over octaves, drawn only where its fade was fitted and never under a feature. Every layer is optional, so a ground of hills alone is the same ground it was, and grounds laid over another are composed into the same layers, each lifted onto its own base (`packages/genshin-engine/src/terrain/createTerrainShapeHeight.ts`).

## Requirements

### Requirement: Ground height is the sum of its optional layers

A ground's height SHALL be the sum of its hills, its sharp features and its residual, where each layer a ground leaves out adds nothing.

#### Scenario: Hills alone

- **GIVEN** a ground has hills and no features and no residual
- **WHEN** its height is read anywhere
- **THEN** the height is the height of its hills alone

#### Scenario: Every layer present

- **GIVEN** a ground has hills, features and a residual
- **WHEN** its height is read at a point
- **THEN** the height is the sum of the three layers at that point

### Requirement: A hill reaches no farther than three of its widths

A hill SHALL contribute nothing to the ground farther than three of its widths from its centre along either axis.

#### Scenario: Point inside a hill's reach

- **GIVEN** a point two of a hill's widths from its centre
- **WHEN** the ground is read there
- **THEN** the hill's share is included

#### Scenario: Point beyond a hill's reach

- **GIVEN** a point more than three of a hill's widths from its centre along one axis
- **WHEN** the ground is read there
- **THEN** the hill's share is none

### Requirement: Features affect only the ground they reach

A sharp feature SHALL affect only the ground within its own bounds, and a plateau with a negative height SHALL draw a basin.

#### Scenario: Plateau's flat top

- **GIVEN** a plateau with a positive height and a radius
- **WHEN** the ground is read inside its radius
- **THEN** the ground stands at the plateau's height

#### Scenario: Negative plateau draws a basin

- **GIVEN** a plateau with a negative height
- **WHEN** the ground is read inside its radius
- **THEN** the ground is sunk below its surroundings

### Requirement: Residual drawn only where its fade allows

The residual SHALL be drawn only where its fade was fitted, SHALL draw nothing outside the fitted grid, and SHALL be kept off the top of every feature.

#### Scenario: Residual outside the fitted grid

- **GIVEN** a point lies outside the residual's fitted grid
- **WHEN** the ground is read there
- **THEN** no residual is added

#### Scenario: Feature's crest carries no residual

- **GIVEN** a point stands at the top of a feature
- **WHEN** the ground is read there
- **THEN** the residual at that point is suppressed by the feature's blend

#### Scenario: Ground without a fade

- **GIVEN** a residual has no fade
- **WHEN** the ground is read anywhere
- **THEN** the whole residual is drawn

### Requirement: Ground laid over another lifted onto its own base

A ground laid over another SHALL be lifted onto its own base where its hills stand, and inside that level SHALL stand exactly as it is drawn alone. This is the composition of a base's own quarters, of a whole-region record and of a plateau.

#### Scenario: Ground laid over keeps its own heights

- **GIVEN** a ground with hills is laid over another ground
- **WHEN** the composed ground is read inside the laid-over ground's level
- **THEN** its heights are those it has when drawn alone

#### Scenario: Ground laid over with no hills

- **GIVEN** a ground with no hills is laid over another ground
- **WHEN** the composed ground is read
- **THEN** its features stand on the first ground's base

### Requirement: A region's piece is the surface of its own outline

A piece laid over a base SHALL be the surface of its own domain alone at every point inside it, and SHALL NOT be summed with the other pieces' levels. Across the seam of each outline a band of the blend width either side SHALL mix each piece's surface by a share that is full a band's width inside and none a band's width outside, the base taking what the shares leave, and outside every outline the base SHALL show.

#### Scenario: A point inside one piece's outline reads that piece's surface

- **GIVEN** two pieces whose outlines overlap, with levels that differ
- **WHEN** the height is read at a point inside one piece's outline and deeper than the band
- **THEN** the height is that piece's surface alone, not the sum of the two

#### Scenario: The height is continuous across an outline's seam

- **GIVEN** a piece's outline with a neighbouring piece or the base on its far side
- **WHEN** the height is read a millimetre either side of the seam
- **THEN** the two heights differ by no more than the ground's slope over that millimetre

#### Scenario: Outside every outline the base shows

- **GIVEN** a point lies beyond the band of every piece's outline
- **WHEN** the height is read there
- **THEN** the height is the base's, with the plateaus laid over it
