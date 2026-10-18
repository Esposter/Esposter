## Purpose

Flowchart edges draw an arrowhead along a right-angled path by default and can carry an editable label, and a selected edge gets the properties panel a selected node has, with a Delete connector action. The arrowhead shows the order of the steps and branch labels show decisions.

## Requirements

### Requirement: A new connector is drawn with an arrowhead

The flowchart editor SHALL draw every connector with an arrowhead at its end, and SHALL draw it along a right-angled path by default.

#### Scenario: A connector drawn between two nodes has an arrow

- **GIVEN** the editor is open on a flowchart
- **WHEN** the author drags a connection between two nodes
- **THEN** the new connector shows an arrowhead at its target
- **AND** its path is right-angled

#### Scenario: A connector created in code has the same default

- **GIVEN** a connector is added without choosing its style
- **WHEN** it is drawn
- **THEN** it shows the same arrowhead and right-angled path as a drawn connector

#### Scenario: A connector saved before this change gains an arrowhead

- **GIVEN** a flowchart was saved before connectors had arrowheads
- **WHEN** the owner opens it
- **THEN** its connectors show an arrowhead

### Requirement: A connector can carry an editable label

The flowchart editor SHALL let the author give a connector a label, which is drawn at the middle of the connector's path.

#### Scenario: Double-clicking a connector adds a label

- **GIVEN** a connector has no label
- **WHEN** the author double-clicks its path
- **THEN** a label input opens
- **AND** entering text and pressing Enter shows that label at the connector's middle

#### Scenario: Leaving the label input saves the label

- **GIVEN** the author is typing a label
- **WHEN** they click away from the input
- **THEN** the label is kept

#### Scenario: Confirming input-method text does not end editing

- **GIVEN** the author is composing text with an input method
- **WHEN** they press Enter to confirm a composed character
- **THEN** the label input stays open

#### Scenario: A label is limited to the node label length

- **GIVEN** the author types a label longer than a node label may be
- **WHEN** the label is saved
- **THEN** the label is refused at the same limit a node label has

### Requirement: A selected connector gets a properties panel

The flowchart editor SHALL show a properties panel for a selected connector, with its label, its path type and a Delete connector action.

#### Scenario: Selecting a connector opens its panel

- **GIVEN** no node is selected
- **WHEN** the author selects a connector
- **THEN** the properties panel shows that connector's label and path

#### Scenario: Selecting a node and a connector shows only the node's panel

- **GIVEN** a node and a connector are both selected
- **WHEN** the panel is shown
- **THEN** only the node's panel is shown

#### Scenario: Delete connector removes the connector

- **GIVEN** a connector is selected
- **WHEN** the author chooses Delete connector
- **THEN** the connector is removed from the flowchart

### Requirement: A connector can be drawn as curved, right-angled or straight

The properties panel SHALL offer three path choices for a connector: curved, right-angled and straight.

#### Scenario: Changing a connector's path

- **GIVEN** a connector is selected
- **WHEN** the author chooses straight
- **THEN** the connector is redrawn as a straight line

#### Scenario: Stored paths outside those three still draw

- **GIVEN** a stored connector uses a path type the panel does not offer
- **WHEN** the flowchart opens
- **THEN** the connector is drawn as stored

### Requirement: Label and path edits are saved like other edits

The editor SHALL save label and path edits through the same autosave as moving a node.

#### Scenario: A label edit is autosaved

- **GIVEN** the author changes a connector's label
- **WHEN** the change is made
- **THEN** it is autosaved with the rest of the flowchart

### Requirement: The published view draws labels and arrowheads

The published flowchart SHALL show each connector's label and arrowhead as the editor does.

#### Scenario: A published connector keeps its label

- **GIVEN** a connector has a label and an arrowhead
- **WHEN** a viewer opens the published flowchart
- **THEN** the label and arrowhead are shown
