## ADDED Requirements

### Requirement: Each end of an arrow takes its own arrowhead

Each end of an arrow SHALL take one arrowhead, chosen from a triangle, a diamond, a circle and a bar, or none at all, independently of the other end.

#### Scenario: An arrow takes a different arrowhead at each end

- **GIVEN** an arrow with no arrowhead at either end
- **WHEN** the owner sets the start to a circle and the end to a diamond
- **THEN** the start draws a circle and the end draws a diamond

#### Scenario: A patch naming an unknown arrowhead is refused

- **GIVEN** a saved whiteboard with an arrow
- **WHEN** an agent patches an end of the arrow to an arrowhead outside the five
- **THEN** the patch is refused
- **AND** the saved content is unchanged

### Requirement: A free arrow end is dragged by its handle

A selected arrow SHALL show a handle on each free end, and dragging a handle SHALL move that end with the pointer as one undo step.

#### Scenario: Dragging a free end moves that end only

- **GIVEN** a selected arrow whose start is bound to a shape and whose end is free
- **WHEN** the owner drags the end's handle by an offset
- **THEN** the end has moved by that offset
- **AND** the start stays on its connection point
- **AND** one undo returns the end to where it was

#### Scenario: Releasing a dragged end on a shape binds it

- **GIVEN** a selected arrow with a free end and a shape on the canvas
- **WHEN** the owner drags the end's handle onto a connection point of the shape and releases it
- **THEN** the end is bound to that connection point

#### Scenario: An arrow bound at both ends shows no end handle

- **GIVEN** an arrow bound at both ends to shapes
- **WHEN** the owner selects the arrow
- **THEN** no handle shows at either end

### Requirement: A selected shape adds a connected shape from its handle

A selected shape SHALL show a handle at each connection point, and dragging a handle to empty canvas SHALL add a shape of the same kind there, joined to the shape by an arrow, as one undo step.

#### Scenario: Dragging a connection handle to empty canvas adds a connected shape

- **GIVEN** a selected Process shape
- **WHEN** the owner drags its bottom handle to an empty point and releases it
- **THEN** a Process shape is added centred on the release point
- **AND** an arrow joins the bottom connection point of the first shape to the nearest connection point of the new shape
- **AND** one undo removes the new shape and the arrow together

#### Scenario: Releasing a handle on another shape joins it without adding a shape

- **GIVEN** a selected Process shape and a Decision shape beside it
- **WHEN** the owner drags the Process shape's handle onto the Decision shape and releases it
- **THEN** an arrow joins the two shapes
- **AND** no shape is added

#### Scenario: A press that does not travel adds nothing

- **GIVEN** a selected Process shape
- **WHEN** the owner presses one of its connection handles and releases it without moving
- **THEN** no shape or arrow is added

#### Scenario: An annotation shows no connection handle

- **GIVEN** a selected Annotation shape
- **WHEN** the owner views the canvas
- **THEN** no connection handle shows on the annotation
