## ADDED Requirements

### Requirement: An owner creates a design from the create flow

The create flow SHALL offer a Design resource, which opens on an empty canvas.

#### Scenario: A Design resource is created from the create flow

- **GIVEN** an owner on the resource explorer's Home
- **WHEN** the owner creates a Design with a name
- **THEN** a Design resource opens on its editor with an empty canvas
- **AND** the resource appears in the owner's list under the Design type

### Requirement: The canvas draws shapes, arrows, text and freehand strokes

The canvas SHALL draw rectangles, ellipses, diamonds, lines, arrows, freehand strokes and text, in a hand-drawn style, and an arrow SHALL be able to bind to the shapes it joins.

#### Scenario: A rectangle, an arrow bound to it and a text label are drawn

- **GIVEN** an empty design
- **WHEN** the owner draws a rectangle, draws an arrow from its edge, and types a label
- **THEN** the document holds the rectangle, the arrow and the label as elements
- **AND** the arrow's binding names the rectangle

### Requirement: A design reopens as it was saved

A saved design SHALL reopen with the same elements, the same geometry and the same z-order.

#### Scenario: A stored design reopens unchanged

- **GIVEN** a saved design with several elements in a set z-order
- **WHEN** the owner reopens it
- **THEN** every element is at its saved position
- **AND** the elements stack in their saved z-order

### Requirement: A design is saved through the one content door

Every change to a design SHALL be saved through the resource content door, and a stale write SHALL be refused rather than overwritten.

#### Scenario: An edit is saved through the content door

- **GIVEN** a design open in its editor
- **WHEN** the owner moves a shape and leaves the editor
- **THEN** the design's content version advances
- **AND** the saved content holds the shape at its new position

### Requirement: Images are file assets of the design

A pasted image SHALL be stored as a file asset of its design, and an element SHALL hold only the file's id.

#### Scenario: A pasted image is stored as a file asset

- **GIVEN** a design open in its editor
- **WHEN** the owner pastes an image onto the canvas
- **THEN** the image is uploaded to the design's file assets
- **AND** the element holds the file's id and no image bytes

#### Scenario: A deleted image is released on the next save

- **GIVEN** a design whose image element the owner has deleted
- **WHEN** the design is next saved
- **THEN** the image's file is released from the design

### Requirement: A design exports to PNG and SVG

A design SHALL export to PNG and to SVG from its resource menu.

#### Scenario: The design exports to SVG

- **GIVEN** a saved design with shapes and text
- **WHEN** the owner exports it as SVG
- **THEN** the file holds every element of the design as drawn on the canvas

### Requirement: An agent reads and edits a design through the generic tools

An agent SHALL read a design's content and edit it by JSON Patch, addressing each element by its id, through the generic resource tools, with no procedure of the design's own. An edit SHALL reach an open editor.

#### Scenario: An agent adds a bound arrow by patch

- **GIVEN** a design open in its editor with a rectangle in it
- **WHEN** an agent patches the design to add an arrow bound to that rectangle
- **THEN** the open editor shows the arrow, bound to the rectangle
- **AND** the saved content holds the arrow in the design's z-order

#### Scenario: A patch leaving a dangling binding is refused

- **GIVEN** a saved design
- **WHEN** an agent patches an arrow's binding to name an element the design does not hold
- **THEN** the patch is refused
- **AND** the saved content is unchanged

#### Scenario: An agent reads the design's schema with its server-filled fields marked

- **GIVEN** a Design resource
- **WHEN** an agent describes its content
- **THEN** the schema describes every element's fields
- **AND** the engine's internal fields are marked read-only

### Requirement: A design is not publishable in this version

A design SHALL NOT have a publish route, and a publish of a design SHALL be refused.

#### Scenario: A design has no publish route

- **GIVEN** a Design resource
- **WHEN** the resource's capabilities are read
- **THEN** the design is not publishable
- **AND** no publish procedure is typed for it
