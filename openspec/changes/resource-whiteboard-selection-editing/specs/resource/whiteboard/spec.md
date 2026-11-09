## ADDED Requirements

### Requirement: A selected element that takes a size shows a handle on each edge

A selected element that takes a size SHALL show a handle on each of its edges and on its top-left and bottom-right corners, and each handle SHALL resize the element along the edge or corner it sits on.

#### Scenario: An edge handle changes one dimension only

- **GIVEN** a selected Process shape
- **WHEN** the owner drags its right edge handle by an offset
- **THEN** its width has changed by that offset
- **AND** its height and its top-left corner are unchanged

#### Scenario: A text box shows only its left and right handles

- **GIVEN** a selected text box
- **WHEN** the owner views the canvas
- **THEN** handles show on its left and right edges
- **AND** no handle shows at its top or bottom edge or at a corner

#### Scenario: A selected arrow or stroke shows no resize handle

- **GIVEN** a selected arrow with both ends free
- **WHEN** the owner views the canvas
- **THEN** no resize handle shows on the arrow

#### Scenario: A resize stops at the smallest size an element takes

- **GIVEN** a selected Process shape
- **WHEN** the owner drags its right edge handle to the left past the shape's left edge
- **THEN** the width stops at the smallest size an element takes
- **AND** the left edge stays where it was

### Requirement: A selection of several elements resizes as one

A selection of several elements SHALL show the same handles around the box of the selection, and a drag of one handle SHALL scale each element of the selection in the same edit.

#### Scenario: Dragging a corner of several shapes scales each of them

- **GIVEN** three shapes selected together
- **WHEN** the owner drags the selection's bottom-right handle by an offset
- **THEN** each shape's box is scaled about the top-left corner of the selection's box
- **AND** one undo returns all three shapes to where they were

#### Scenario: An arrow bound to a resized shape follows it

- **GIVEN** a selected shape, and a selected arrow bound at its start to that shape and free at its end
- **WHEN** the owner drags the selection's bottom-right handle by an offset
- **THEN** the arrow's start is on the shape's connection point after the resize
- **AND** the arrow's free end is scaled with the selection

#### Scenario: A resize of several stops where the smallest element stops

- **GIVEN** a selection of a small shape and a large shape
- **WHEN** the owner drags a handle past the point where the small shape reaches its minimum size
- **THEN** no element of the selection is smaller than the minimum size

#### Scenario: A selection with no height has no top or bottom handle

- **GIVEN** two free arrows lying on one horizontal line, both selected
- **WHEN** the owner views the canvas
- **THEN** no top or bottom handle shows around the selection

### Requirement: Alt and a drag copies the selection and moves the copies

A drag of a selected element with Alt held SHALL leave the originals where they are and move a copy of the selection, which becomes the selection, as one undo step.

#### Scenario: Alt and a drag leaves the originals and moves the copies

- **GIVEN** a selected Process shape
- **WHEN** the owner holds Alt and drags the shape by an offset
- **THEN** the original is where it was
- **AND** a copy has moved by the offset and is the selection
- **AND** one undo removes the copy

#### Scenario: Alt and a drag copies an arrow with the shapes it is bound to

- **GIVEN** a selected shape and a selected arrow bound at its start to that shape
- **WHEN** the owner holds Alt and drags both by an offset
- **THEN** the copied arrow is bound to the copied shape
- **AND** the original arrow is still bound to the original shape

#### Scenario: An Alt press without travel copies nothing

- **GIVEN** a selected Process shape
- **WHEN** the owner presses the shape with Alt held and releases it without moving
- **THEN** no copy is added
