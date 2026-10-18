## Purpose

How a glyph or a game mark is traced from its reference into the SVG path the component draws, at the source's full resolution.

## Requirements

### Requirement: A vector mark is drawn from its published paths as it is

A mark that is already a vector SHALL be drawn from its published paths unchanged, so that no edge of it can chip.

#### Scenario: Vector logo drawn

- **GIVEN** a game logo published as a vector
- **WHEN** the screen draws it
- **THEN** its published paths are drawn as they are

### Requirement: A glyph is traced from the game's own mark at full resolution

A glyph SHALL be traced from the game's own mark at the source's full resolution, never at a reduced one.

#### Scenario: Glyph traced

- **GIVEN** a glyph in a mark's reference
- **WHEN** the glyph is traced
- **THEN** the trace runs at the source's full resolution
- **AND** the region is printed beside the trace for checking

### Requirement: Ink is told from paper by its contrast with the region's corners

A mark's ink SHALL be told from its paper by how far each pixel strays from the colour at the region's corners, so that a mark dark on light, light on dark or coloured traces alike.

#### Scenario: Marks in different colours

- **GIVEN** one mark dark on white and another lit on black
- **WHEN** both are traced
- **THEN** each mark's ink is traced from its paper in the same way

### Requirement: Specks and small holes are cleared before tracing and every path is kept

Runs of ink or holes smaller than a sliver of the region SHALL be cleared from the split before tracing, and every path the trace finds SHALL be kept.

#### Scenario: Speck beside a glyph

- **GIVEN** a speck of compression or a sparkle beside a glyph
- **WHEN** the glyph is traced
- **THEN** the speck is cleared before the trace
- **AND** every path of the glyph is kept

### Requirement: A traced path is written in its shortest form with the same points

A traced path SHALL be written in its shortest form, with the same points, and its opening move kept absolute so that joined paths keep their places.

#### Scenario: Paths joined into one shape

- **GIVEN** the paths of one trace joined into one shape
- **WHEN** the shape is drawn
- **THEN** each path keeps its place
- **AND** the points are unchanged from the trace

### Requirement: Only shapes derived from the game's marks ship with a screen

A screen SHALL ship only shapes derived from the game's marks through this tracing.

#### Scenario: Screen's shapes checked

- **GIVEN** a screen that draws a game mark
- **WHEN** its shapes are checked
- **THEN** each shape is derived from the game's mark by this tracing or is a published vector
