## Purpose

Flowchart is Publishable — a read-only VueFlow render at /view/Flowchart/[id], the simplest capability adoption in the platform. Viewers can pan and zoom a published diagram but cannot change it.

## Requirements

### Requirement: A published flowchart has a read-only public view

The owner SHALL be able to publish a flowchart, which gives it a public read-only view at its own address.

#### Scenario: Publishing makes the diagram viewable

- **GIVEN** the owner has a flowchart
- **WHEN** they publish it
- **THEN** the diagram is viewable at its public address

#### Scenario: Unpublishing removes the public view

- **GIVEN** a flowchart is published
- **WHEN** the owner unpublishes it
- **THEN** its public address no longer shows the diagram

### Requirement: The public view cannot change the diagram

The public view SHALL NOT let a viewer move, connect or select the diagram's nodes, and SHALL keep panning and zooming available.

#### Scenario: A viewer cannot move a node

- **GIVEN** a viewer has the public view open
- **WHEN** they try to drag a node
- **THEN** the node does not move

#### Scenario: A viewer can pan and zoom

- **GIVEN** a viewer has the public view open
- **WHEN** they pan or zoom the diagram
- **THEN** the view moves and zooms

### Requirement: The public view draws nodes as the editor does

The public view SHALL draw every node type the same way the editor does, including colour and size the owner picked.

#### Scenario: A coloured node looks the same publicly

- **GIVEN** the owner picked a colour and a size for a node
- **WHEN** a viewer opens the public view
- **THEN** the node shows that colour and size
