## ADDED Requirements

### Requirement: An element's outline, arrow, stroke and text take the colour the owner chooses

The owner SHALL choose a colour for the outline and text of a shape or a sticky note, for an arrow, for a text box and for a freehand stroke, and an element with no colour chosen SHALL draw in the page text colour.

#### Scenario: A chosen colour draws the outline and the text

- **GIVEN** a Process shape with the text Review on the canvas
- **WHEN** the owner chooses red as the shape's colour
- **THEN** the shape's outline and its text draw in red
- **AND** the exported image draws the outline and the text in red

#### Scenario: An element with no colour draws in the page text colour

- **GIVEN** a Process shape with no colour chosen
- **WHEN** the page switches between light and dark mode
- **THEN** the shape's outline and its text follow the page text colour

#### Scenario: Clearing a colour returns the element to the page text colour

- **GIVEN** a Process shape with red as its colour
- **WHEN** the owner clears its colour
- **THEN** the shape's outline and its text draw in the page text colour again

#### Scenario: A colour that is not a hex colour is refused

- **GIVEN** a saved whiteboard with a Process shape
- **WHEN** an agent patches the shape's colour to the word red
- **THEN** the patch is refused
- **AND** the saved content is unchanged

### Requirement: An element's outline, arrow and stroke take a width of thin, medium or bold

The owner SHALL choose a width of thin, medium or bold for a shape, a sticky note, an arrow and a freehand stroke, and until a width is chosen each of them draws at medium.

#### Scenario: A bold width draws the outline and the export at bold

- **GIVEN** a Process shape drawn at medium width
- **WHEN** the owner chooses bold
- **THEN** the shape's outline draws at the bold width
- **AND** the exported image draws the outline at that width

#### Scenario: A new arrow draws at medium width

- **GIVEN** an owner with a whiteboard open
- **WHEN** the owner draws a new arrow
- **THEN** the arrow's route draws at medium width

#### Scenario: A width that is not one of the three is refused

- **GIVEN** a saved whiteboard with a freehand stroke
- **WHEN** an agent patches the stroke's width to 3
- **THEN** the patch is refused
- **AND** the saved content is unchanged

### Requirement: A shape's or a sticky note's outline and an arrow's route take a dash pattern

The owner SHALL choose solid, dashed or dotted for the outline of a shape or a sticky note and for the route of an arrow, and until a pattern is chosen each draws solid.

#### Scenario: A dashed outline draws with gaps on the canvas and in the export

- **GIVEN** a Process shape with a solid outline
- **WHEN** the owner chooses dashed
- **THEN** the shape's outline draws with gaps on the canvas
- **AND** the exported image draws the outline with the same gaps

#### Scenario: An arrow route draws dotted when the owner chooses dotted

- **GIVEN** an arrow with a solid route
- **WHEN** the owner chooses dotted
- **THEN** the arrow's route draws dotted
- **AND** its arrowheads stay filled

#### Scenario: A dash pattern that is not one of the three is refused

- **GIVEN** a saved whiteboard with a Process shape
- **WHEN** an agent patches the shape's dash pattern to wavy
- **THEN** the patch is refused
- **AND** the saved content is unchanged

### Requirement: A shape takes a fill the owner chooses or none, and a new shape starts with none

A shape SHALL take a fill the owner chooses or no fill, and a new shape SHALL start with no fill.

#### Scenario: A new shape starts with no fill

- **GIVEN** an owner with a whiteboard open
- **WHEN** the owner places a rectangle with the shape tool
- **THEN** the shape has no fill and its outline draws on the canvas

#### Scenario: Clearing a shape fill leaves it open

- **GIVEN** a shape with a blue fill
- **WHEN** the owner clears its fill
- **THEN** the shape draws with no fill

#### Scenario: A sticky note keeps the fill it starts with

- **GIVEN** an owner with a whiteboard open
- **WHEN** the owner places a sticky note
- **THEN** the note draws with the yellow fill it starts with

#### Scenario: A fill that is neither a hex colour nor empty is refused

- **GIVEN** a saved whiteboard with a shape
- **WHEN** an agent patches the shape's fill to the word blue
- **THEN** the patch is refused
- **AND** the saved content is unchanged
