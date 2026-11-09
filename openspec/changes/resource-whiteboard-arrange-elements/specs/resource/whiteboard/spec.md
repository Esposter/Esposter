## ADDED Requirements

### Requirement: A selection of boxes aligns to one edge or centre

Six align commands SHALL each move every box of a selection of two or more so the boxes line up with the selection's box at its left, centre, right, top, middle or bottom, as one undo step.

#### Scenario: Aligning to the left edge moves each box to the leftmost edge

- **GIVEN** three shapes whose left edges are at different places
- **WHEN** the owner chooses align left
- **THEN** each shape's left edge is at the leftmost of the three
- **AND** one undo returns the three shapes to where they were

#### Scenario: Aligning leaves a free arrow where it was

- **GIVEN** a selected shape and a selected arrow with both ends free
- **WHEN** the owner chooses align top
- **THEN** the shape's top edge is at the top of the selection's box
- **AND** the arrow's ends have not moved

#### Scenario: Align is disabled when fewer than two boxes are selected

- **GIVEN** a selection of one shape and one free arrow
- **WHEN** the owner looks at the align controls
- **THEN** every align control is disabled

### Requirement: A selection of three or more boxes distributes with equal gaps

Distribute SHALL space a selection of three or more boxes evenly, horizontally or vertically, keeping the two outermost boxes in place, as one undo step.

#### Scenario: Distributing horizontally makes every gap equal

- **GIVEN** three shapes of different widths with uneven gaps between them
- **WHEN** the owner distributes them horizontally
- **THEN** each gap between neighbouring shapes is the same
- **AND** the leftmost and the rightmost shapes have not moved

#### Scenario: Distribute is disabled below three boxes

- **GIVEN** a selection of two shapes
- **WHEN** the owner looks at the distribute controls
- **THEN** every distribute control is disabled

### Requirement: A selection stacks as one, keeping its order

Each stacking command SHALL move every selected element together, keeping their order among themselves, and SHALL be disabled when the selection holds an element that cannot move that way.

#### Scenario: Bring to front lifts a selection above the rest in its order

- **GIVEN** four elements in the order A, B, C and D, with A and C selected
- **WHEN** the owner chooses bring to front
- **THEN** the order is B, D, A and C

#### Scenario: Bring forward moves a selection one step past the element above it

- **GIVEN** three elements in the order A, B and C, with A and B selected
- **WHEN** the owner chooses bring forward
- **THEN** the order is C, A and B

#### Scenario: A selection holding the top element cannot bring forward

- **GIVEN** a selection that holds the topmost element
- **WHEN** the owner looks at the stacking controls
- **THEN** bring forward and bring to front are disabled

### Requirement: The bracket keys stack the selection

Cmd or Ctrl with the closing bracket SHALL bring the selection forward and Cmd or Ctrl with the opening bracket SHALL send it backward, and holding Shift as well SHALL take the selection to the front or the back.

#### Scenario: The bracket keys stack the selection

- **GIVEN** two shapes selected
- **WHEN** the owner presses Cmd or Ctrl with the closing bracket
- **THEN** the selection is brought forward, as the bring forward control brings it

#### Scenario: Shift with the bracket keys sends the selection to the ends

- **GIVEN** two shapes selected and drawn above the other elements
- **WHEN** the owner presses Cmd or Ctrl with Shift and the opening bracket
- **THEN** the selection is sent to the back, as the send to back control sends it

#### Scenario: The stacking keys do nothing with no selection

- **GIVEN** no element selected
- **WHEN** the owner presses Cmd or Ctrl with the closing bracket
- **THEN** the order of the elements is unchanged
