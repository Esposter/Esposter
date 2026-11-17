## ADDED Requirements

### Requirement: A hovered node is named on its outline

The canvas SHALL name a node by its title in the layers tree on the node's hover outline while the pointer is over the node.

#### Scenario: Hovering a text node names it on its outline

- **GIVEN** a webpage open in the editor with a text node
- **WHEN** the owner hovers the text node
- **THEN** the outline of the text node carries the name the layers tree gives it

#### Scenario: The name leaves when the pointer leaves the node

- **GIVEN** a text node whose name is shown on hover
- **WHEN** the owner moves the pointer off the node
- **THEN** no name is shown on the canvas

#### Scenario: A node at the top edge of the canvas shows its name

- **GIVEN** a text node whose top edge is at the top of the canvas
- **WHEN** the owner hovers the text node
- **THEN** its name is shown inside its outline

### Requirement: A selected node moves by dragging its handle

A selected node SHALL show a move handle in its toolbar, and dragging the handle SHALL move the node to the slot under the pointer that accepts its type.

#### Scenario: Dragging a node handle into another column moves it there

- **GIVEN** a text node in the first of two columns
- **WHEN** the owner drags its handle into the second column between two of its blocks and releases it
- **THEN** the text node is in the second column at that position
- **AND** the first column no longer holds it

#### Scenario: A section cannot be dropped into a section it holds

- **GIVEN** a section that holds a second section with a text block in it
- **WHEN** the owner drags the outer section's handle into the inner section and releases it
- **THEN** the outer section stays where it was

#### Scenario: Releasing a node where no slot accepts it leaves it in place

- **GIVEN** a text node selected in a column
- **WHEN** the owner drags its handle over a place where no slot accepts text and releases it
- **THEN** the text node stays where it was

#### Scenario: Escape cancels a node drag

- **GIVEN** a node handle being dragged over a column
- **WHEN** the owner presses Escape
- **THEN** the drag ends
- **AND** the node stays where it was

#### Scenario: Undo returns a dragged node to its place

- **GIVEN** a node moved by its handle
- **WHEN** the owner undoes once
- **THEN** the node is back in its earlier slot and position
