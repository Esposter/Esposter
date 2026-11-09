## MODIFIED Requirements

### Requirement: Shapes are drawn with a hand-drawn outline

Each shape SHALL draw its outline with an offset that is fixed for that shape and that its sketch level sets, so the same shape draws the same outline each time it is drawn.

#### Scenario: A shape draws the same hand-drawn outline on every render

- **GIVEN** a Process shape on the canvas
- **WHEN** the canvas is drawn twice
- **THEN** the shape's outline is the same both times

## ADDED Requirements

### Requirement: A sketch level sets how far a shape, a sticky note and an arrow are sketched

The owner SHALL set a sketch level of architect, artist or cartoonist for each shape, sticky note and arrow, and until a level is chosen each draws at the artist level.

#### Scenario: Architect draws a shape with straight edges

- **GIVEN** a Process shape drawn at the artist level
- **WHEN** the owner sets its level to architect
- **THEN** the shape's outline runs straight between its corners
- **AND** the exported image draws the outline the same way

#### Scenario: Cartoonist draws a larger offset than artist

- **GIVEN** a Process shape drawn at the artist level
- **WHEN** the owner sets its level to cartoonist
- **THEN** the outline moves further from its box than it did at the artist level

#### Scenario: An arrow route is drawn straight at the architect level

- **GIVEN** an arrow drawn at the artist level
- **WHEN** the owner sets its level to architect
- **THEN** the arrow's route draws without any hand-drawn offset

#### Scenario: A sketch level that is not one of the three is refused

- **GIVEN** a saved whiteboard with a Process shape
- **WHEN** an agent patches the shape's level to wobbly
- **THEN** the patch is refused
- **AND** the saved content is unchanged

### Requirement: A shape's corners are sharp or round

The owner SHALL set a shape's corners to sharp or round, and a round corner SHALL curve by a radius that grows with the shape's size up to a limit.

#### Scenario: Round corners curve the outline

- **GIVEN** a Rectangle shape with sharp corners
- **WHEN** the owner sets its corners to round
- **THEN** each corner of the outline is curved
- **AND** the exported image curves the same corners

#### Scenario: A round corner stops growing at the limit

- **GIVEN** a Rectangle below the size limit with round corners
- **WHEN** the owner enlarges the Rectangle past the size limit
- **THEN** each of its corners curves by the radius the limit gives

#### Scenario: An ellipse offers no corner setting

- **GIVEN** an Ellipse shape on the canvas
- **WHEN** the owner selects it
- **THEN** the properties panel offers no corner setting

#### Scenario: A corner setting that is not sharp or round is refused

- **GIVEN** a saved whiteboard with a Rectangle shape
- **WHEN** an agent patches the shape's corners to pointed
- **THEN** the patch is refused
- **AND** the saved content is unchanged

### Requirement: A freehand stroke is drawn smoothed through its points

A freehand stroke SHALL be drawn as a smooth curve through the points the pointer passed, on the canvas and in the export.

#### Scenario: A freehand stroke draws smoothed

- **GIVEN** a freehand stroke drawn with a quick turn
- **WHEN** the owner views the canvas
- **THEN** the stroke has no corner at the points the pointer passed
- **AND** the exported image draws the same curve

#### Scenario: A stroke saved before the change draws smoothed

- **GIVEN** a freehand stroke saved before this change
- **WHEN** the owner opens the whiteboard
- **THEN** the stroke draws smoothed through the points it was saved with
