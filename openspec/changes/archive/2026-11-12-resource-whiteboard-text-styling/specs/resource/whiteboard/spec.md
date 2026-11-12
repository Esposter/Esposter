## MODIFIED Requirements

### Requirement: Text wraps at the element's width

A shape's, a sticky note's and a text box's text SHALL wrap at the element's width unless a text box is set to auto width, and an arrow's label at a fixed label width. The canvas and the exported image SHALL break the text at the same words.

#### Scenario: A long label wraps inside its shape

- **GIVEN** a Process shape whose text is longer than its width
- **WHEN** the owner views the canvas or exports the whiteboard
- **THEN** the text is drawn on more than one line, each line within the shape's width
- **AND** the export breaks the text at the same words as the canvas

## ADDED Requirements

### Requirement: A text box set to auto width sizes its box to its text

The owner SHALL set a text box to auto width or back to a wrapped width, and in auto width the text is not wrapped and the box is as wide as its widest line.

#### Scenario: Auto width sizes the box to its widest line

- **GIVEN** a wrapped text box that reads Review the order at its drag width
- **WHEN** the owner sets the text box to auto width
- **THEN** the text is not broken within a line
- **AND** the box is as wide as its widest line

#### Scenario: Auto width grows the box as a longer line is committed

- **GIVEN** a text box in auto width
- **WHEN** the owner types a longer line and commits it
- **THEN** the box grows to the new widest line
- **AND** the line is not broken

#### Scenario: Returning to a wrapped width keeps the box width

- **GIVEN** a text box in auto width
- **WHEN** the owner sets it back to a wrapped width
- **THEN** the text wraps at the width the box has

### Requirement: A text's size is one of four steps

The owner SHALL choose one of four sizes for the text of a shape, a sticky note, a text box or an arrow's label, and until a size is chosen the text draws at the smallest size.

#### Scenario: A larger size draws and wraps the text larger

- **GIVEN** a Process shape with a sentence of text
- **WHEN** the owner chooses the largest size
- **THEN** the text draws at that size and wraps onto more lines within the shape's width
- **AND** the exported image draws the text at the same size

#### Scenario: Text draws at the smallest size until a size is chosen

- **GIVEN** a Process shape with text and no size chosen
- **WHEN** the owner views the canvas
- **THEN** the text draws at the smallest of the four sizes

#### Scenario: A size that is not one of the four is refused

- **GIVEN** a saved whiteboard with a Process shape
- **WHEN** an agent patches the shape's text size to 17
- **THEN** the patch is refused
- **AND** the saved content is unchanged

### Requirement: A text is aligned within its element

The owner SHALL align the text of a shape, a sticky note or a text box to the left, centre or right, and the text of a shape or a sticky note to the top, middle or bottom, and until an alignment is chosen a shape's and a sticky note's text is centred and a text box's text starts at its left edge.

#### Scenario: Shape text aligns to the left and the top

- **GIVEN** a Process shape with text centred in it
- **WHEN** the owner aligns the text to the left and to the top
- **THEN** the text starts at the shape's left inside edge and its first line sits at the top of the shape
- **AND** the exported image aligns the text the same way

#### Scenario: Text box text aligns to the right

- **GIVEN** a text box with the text Review at its drag width
- **WHEN** the owner aligns the text to the right
- **THEN** the text ends at the box's right edge

#### Scenario: Shape text is centred until an alignment is chosen

- **GIVEN** a new Process shape with text
- **WHEN** the owner views the canvas
- **THEN** the text is centred in the shape

#### Scenario: An arrow label has no alignment control

- **GIVEN** an arrow with a label
- **WHEN** the owner selects the arrow
- **THEN** the properties panel offers no alignment for the label
- **AND** the label stays centred at the route's midpoint

#### Scenario: An alignment that is not one of the choices is refused

- **GIVEN** a saved whiteboard with a Process shape
- **WHEN** an agent patches the shape's text alignment to justify
- **THEN** the patch is refused
- **AND** the saved content is unchanged

### Requirement: A text being edited draws its draft in its element

While the owner edits a text, its element SHALL draw the draft in place of the committed text, so the element does not change when the owner commits the edit.

#### Scenario: The element shows the draft as the owner types

- **GIVEN** a Process shape with the text Review
- **WHEN** the owner double clicks the shape and types more text without committing
- **THEN** the shape already draws the typed text

#### Scenario: Escape returns the element to its committed text

- **GIVEN** a Process shape with a draft typed but not committed
- **WHEN** the owner presses Escape
- **THEN** the shape draws its committed text again

#### Scenario: Committing does not move the text

- **GIVEN** a Process shape showing a draft that differs from its committed text
- **WHEN** the owner commits the draft
- **THEN** the text draws at the same place and in the same lines as it did while being typed
