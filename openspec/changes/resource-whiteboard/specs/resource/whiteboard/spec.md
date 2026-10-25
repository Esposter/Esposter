## ADDED Requirements

### Requirement: An owner creates a whiteboard from the create flow

The create flow SHALL offer a Whiteboard resource, which opens on an empty canvas.

#### Scenario: A Whiteboard is created from the create flow

- **GIVEN** an owner on the resource explorer's Home
- **WHEN** the owner creates a Whiteboard with a name
- **THEN** a Whiteboard resource opens on its editor with an empty canvas
- **AND** the resource appears in the owner's list under the Whiteboard type

### Requirement: The palette offers the flowchart shapes with the basic shapes

The palette SHALL offer rectangles, ellipses and diamonds, and the six flowchart shapes, Terminal, Process, Decision, Input/Output, Predefined Process and Annotation, grouped together.

#### Scenario: The palette lists the flowchart shapes

- **GIVEN** an owner opens a whiteboard in the editor
- **WHEN** the palette is shown
- **THEN** the palette lists the rectangle, ellipse and diamond
- **AND** it lists Terminal, Process, Decision, Input/Output, Predefined Process and Annotation together

#### Scenario: An annotation takes no connection

- **GIVEN** an Annotation shape on the canvas
- **WHEN** the owner draws an arrow towards it
- **THEN** the arrow does not bind to the annotation

### Requirement: An arrow binds its ends to shapes and carries arrowheads at either end

An arrow SHALL bind each end to a connection point of a shape, or leave the end free at a position. It SHALL take an arrowhead at either end, and one of three path kinds: straight, curved or right-angled.

#### Scenario: An arrow binds its ends to two shapes' connection points

- **GIVEN** a Decision shape and a Process shape on the canvas
- **WHEN** the owner draws an arrow from the decision's bottom point to the process's left point
- **THEN** the arrow is bound at both ends to those connection points
- **AND** moving either shape keeps the arrow attached to its point

#### Scenario: An arrow with an arrowhead at each end

- **GIVEN** an arrow bound at both ends
- **WHEN** the owner sets an arrowhead on its start and on its end
- **THEN** the arrow draws an arrowhead at both ends

### Requirement: Moving a shape keeps its arrows attached

Moving a shape SHALL reroute each arrow bound to it, in the same edit as the move.

#### Scenario: Moving a shape keeps its arrows attached

- **GIVEN** a Process shape with a right-angled arrow bound to its bottom point
- **WHEN** the owner drags the shape to a new place
- **THEN** the arrow is rerouted from the moved point
- **AND** the move and the reroute undo as one step

### Requirement: Deleting a shape removes the arrows bound to it

Deleting a shape SHALL ask the owner first, and SHALL remove each arrow bound only to that shape.

#### Scenario: Deleting a shape from the canvas asks first and then removes its arrows

- **GIVEN** a Process shape with an arrow bound to it
- **WHEN** the owner deletes the shape
- **THEN** the owner is asked to confirm before anything is removed
- **AND** once confirmed, the arrow bound only to that shape is removed

### Requirement: The owner selects several shapes at once

The canvas SHALL select a shape with a click, add to the selection with Shift, and select every element a marquee fully covers.

#### Scenario: A marquee selects every shape it covers

- **GIVEN** three shapes on the canvas and a marquee drawn over two of them
- **WHEN** the owner releases the marquee
- **THEN** the two shapes it covers are selected
- **AND** the third shape is not selected

### Requirement: Text is edited in place

A shape's text, an arrow's label and a sticky note's text SHALL be edited in place by double clicking the element.

#### Scenario: Double clicking a shape edits its text in place

- **GIVEN** a Process shape with the text Review
- **WHEN** the owner double clicks the shape and types a new text
- **THEN** the shape shows the new text where the old one was

#### Scenario: An arrow's label sits at its midpoint

- **GIVEN** an arrow with a label
- **WHEN** the owner views the canvas
- **THEN** the label is drawn at the arrow's midpoint

### Requirement: Freehand strokes follow the pointer

A freehand stroke SHALL be drawn along the path the pointer takes while it is held down.

#### Scenario: A freehand stroke follows the pointer

- **GIVEN** the freehand tool is selected
- **WHEN** the owner drags the pointer across the canvas
- **THEN** a stroke is drawn along the path the pointer took

### Requirement: Images and sticky notes are placed on the canvas

A pasted image SHALL be stored as a file asset of its whiteboard, and a sticky note SHALL take a fill and text.

#### Scenario: A pasted image is stored as a file asset

- **GIVEN** a whiteboard open in its editor
- **WHEN** the owner pastes an image onto the canvas
- **THEN** the image is uploaded to the whiteboard's file assets
- **AND** the element holds the file's id and no image bytes

#### Scenario: A sticky note takes a fill and text

- **GIVEN** a sticky note on the canvas
- **WHEN** the owner sets its fill and types text in it
- **THEN** the note draws that fill with that text

### Requirement: Shapes are drawn with a hand-drawn outline

Each shape SHALL draw its outline with a small offset that is fixed for that shape, so the same shape draws the same outline each time it is drawn.

#### Scenario: A shape draws the same hand-drawn outline on every render

- **GIVEN** a Process shape on the canvas
- **WHEN** the canvas is drawn twice
- **THEN** the shape's outline is the same both times

### Requirement: Undo reverts an edit as one step

Each edit SHALL be one undo step, so an undo reverts a move together with the reroute it caused.

#### Scenario: Undo reverts a move and its reroute together

- **GIVEN** a shape moved with an arrow rerouted by the move
- **WHEN** the owner undoes the move
- **THEN** the shape and the arrow return to where they were before the move

### Requirement: A whiteboard exports to SVG and to PNG

A whiteboard SHALL export to SVG and to PNG from its resource menu, with both drawn from the same canvas.

#### Scenario: The whiteboard exports to SVG

- **GIVEN** a saved whiteboard with shapes and text
- **WHEN** the owner exports it as SVG
- **THEN** the file holds every element of the whiteboard as drawn on the canvas

#### Scenario: The whiteboard exports to PNG

- **GIVEN** a saved whiteboard with shapes and text
- **WHEN** the owner exports it as PNG
- **THEN** the file is an image of the same elements as the SVG export

### Requirement: An agent reads and edits a whiteboard through the generic tools

An agent SHALL read a whiteboard's content and edit it by JSON Patch, through the generic resource tools. An agent that moves a shape SHALL use the typed move command, which reroutes each arrow bound to the shape in the same write.

#### Scenario: An agent adds an arrow bound to a shape by patch

- **GIVEN** a whiteboard open in its editor with a Process shape in it
- **WHEN** an agent patches the whiteboard to add an arrow bound to that shape
- **THEN** the open editor shows the arrow, bound to the shape
- **AND** the saved content holds the arrow in the whiteboard's z-order

#### Scenario: An agent moves a bound shape through the typed move

- **GIVEN** a saved whiteboard with a Process shape and an arrow bound to it
- **WHEN** an agent moves the shape with the typed move command
- **THEN** the saved content holds the shape at its new place
- **AND** the arrow is rerouted from the moved point in the same write

#### Scenario: A patch leaving a dangling binding is refused

- **GIVEN** a saved whiteboard
- **WHEN** an agent patches an arrow's binding to name a shape the whiteboard does not hold
- **THEN** the patch is refused
- **AND** the saved content is unchanged
