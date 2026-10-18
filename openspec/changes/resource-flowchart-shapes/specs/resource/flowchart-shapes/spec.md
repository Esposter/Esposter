## ADDED Requirements

### Requirement: The palette offers the six standard flowchart shapes

The Flowchart palette SHALL offer the six standard shapes together under one Flowchart group.

#### Scenario: The palette lists the six shapes

- **GIVEN** an owner opens a flowchart in the editor
- **WHEN** the palette is shown
- **THEN** the palette lists Terminal, Process, Decision, Input/Output, Predefined Process and Annotation
- **AND** all six are grouped under Flowchart

### Requirement: Each shape scales with its node and takes its chosen colour

Each shape SHALL be drawn as an outline that scales with its node and takes the background colour set in the properties panel.

#### Scenario: A decision draws as a diamond in the chosen colour

- **GIVEN** a Decision node whose background colour is set in the properties panel
- **WHEN** the owner views the flowchart
- **THEN** the node is drawn as a diamond filled with that colour
- **AND** resizing the node scales the diamond to fit

### Requirement: Each connectable shape offers a connection point on every side

Every connectable shape SHALL offer a connection point on each side, and an edge SHALL be able to start or end at any of them.

#### Scenario: An edge can leave a decision from its bottom and return to its left

- **GIVEN** a Decision node and a Process node on the canvas
- **WHEN** the owner draws an edge from the decision's bottom point to the process node's left point
- **THEN** the edge connects the two nodes
- **AND** a second edge from the process node back to the decision's left point also connects

### Requirement: An annotation accepts no edge

An Annotation node SHALL NOT accept an edge.

#### Scenario: An annotation refuses an edge

- **GIVEN** an Annotation node beside a Process node
- **WHEN** the owner tries to draw an edge to the annotation
- **THEN** no edge is created

### Requirement: A double click edits a shape's label in place

A double click on a shape SHALL open its label for editing on the canvas.

#### Scenario: Double clicking a shape edits its label

- **GIVEN** a Process node labelled Review
- **WHEN** the owner double clicks the node
- **THEN** the label becomes editable on the node showing Review
- **AND** the text the owner enters becomes the node's label when editing ends

### Requirement: Content saved under the retired rectangle name SHALL NOT load

A flowchart holding a node of the retired Rectangle type SHALL NOT open.

#### Scenario: A flowchart saved with a rectangle does not open

- **GIVEN** a flowchart stored with a node of the retired Rectangle type
- **WHEN** the owner opens the flowchart
- **THEN** the flowchart does not open
- **AND** no node of the flowchart is drawn

### Requirement: Shapes snap to the grid

A shape moved on the canvas SHALL snap to the nearest line of the visible grid.

#### Scenario: A shape dropped off the grid snaps to the nearest grid line

- **GIVEN** snap to grid is on
- **WHEN** the owner drops a shape between two grid lines
- **THEN** the shape lands on the nearest grid line

### Requirement: The published flowchart draws every shape

A published flowchart SHALL draw every shape the editor offers.

#### Scenario: A published flowchart shows its decision shape

- **GIVEN** a published flowchart containing a Decision node
- **WHEN** a reader opens the published flowchart
- **THEN** the decision is drawn as a diamond
