## ADDED Requirements

### Requirement: An editor makes no request to a third-party origin of its own

An editor SHALL make no request to a third-party origin, except for content the owner adds.

#### Scenario: Opening an editor requests no third-party origin

- **GIVEN** an owner who opens a webpage editor
- **WHEN** the editor finishes loading
- **THEN** no request is made to an origin outside the app

### Requirement: Rendering a large document stays within its budget

A document of 2,000 nodes SHALL render to HTML in under 20 milliseconds.

#### Scenario: Rendering a large document stays under the budget

- **GIVEN** a webpage document of 2,000 nodes
- **WHEN** the document is rendered to HTML
- **THEN** the rendering completes in under 20 milliseconds

### Requirement: A single edit applies within its budget and can be reversed exactly

One edit SHALL apply to a 2,000-node document in under 0.5 milliseconds, and applying its recorded inverse SHALL restore the document exactly.

#### Scenario: A single edit applies within the budget

- **GIVEN** a document of 2,000 nodes
- **WHEN** one edit is applied
- **THEN** the edit completes in under 0.5 milliseconds

#### Scenario: An edit's inverse restores the document exactly

- **GIVEN** a document of 2,000 nodes and one applied edit
- **WHEN** the edit's recorded inverse is applied
- **THEN** the document equals the document before the edit

### Requirement: An edit shows on the canvas within its budget

A prop or style edit in a 2,000-node document SHALL show on the canvas within 50 milliseconds at the 95th percentile.

#### Scenario: An edit shows on the canvas within the budget

- **GIVEN** a document of 2,000 nodes open in the editor
- **WHEN** the owner changes a prop or a style
- **THEN** the change shows on the canvas within 50 milliseconds at the 95th percentile

### Requirement: A selection change shows within one animation frame

A selection change SHALL show its outline on the canvas within one animation frame.

#### Scenario: Selecting a node outlines it within one frame

- **GIVEN** a document open in the editor
- **WHEN** the owner selects a node
- **THEN** the selection outline appears within one animation frame

### Requirement: The starter email compiles within its budget

Compiling the starter email on the server SHALL take under 250 milliseconds at the 95th percentile.

#### Scenario: The starter email compiles within the budget

- **GIVEN** the starter email
- **WHEN** it is compiled on the server
- **THEN** the compile completes in under 250 milliseconds at the 95th percentile

### Requirement: The canvas holds every node within one pixel of the published page

The canvas SHALL hold every node's box within one pixel of the same node's box on the published page, at each device width.

#### Scenario: The canvas matches the published page within one pixel

- **GIVEN** the starter webpage
- **WHEN** it is compared at desktop, tablet and mobile widths
- **THEN** every node's box on the canvas is within one pixel of its box on the published page

#### Scenario: A published page's own scripts run under the app's policy

- **GIVEN** a published page with a script of its own
- **WHEN** a reader opens the page
- **THEN** the script runs under the same content policy as the app

### Requirement: The email canvas stays close to the compiled email

The email canvas SHALL hold each section, column and leaf within a few pixels of the compiled email, at desktop and mobile width.

#### Scenario: The email canvas stays close to the compiled email

- **GIVEN** the starter email
- **WHEN** it is compared at desktop and mobile widths
- **THEN** each section, column and leaf on the canvas is within a few pixels of its place in the compiled email

### Requirement: Every type's output matches its expected output

Each node type's published output SHALL match its expected output for every edge value of its props, and hostile markup SHALL be removed from raw HTML.

#### Scenario: A type's output matches for every edge value

- **GIVEN** a node type and a fixture for each edge value of its props
- **WHEN** the type's output is produced for each fixture
- **THEN** each output equals its expected output

#### Scenario: A hostile markup vector in custom HTML is removed

- **GIVEN** custom HTML containing a hostile markup vector
- **WHEN** the block's output is produced
- **THEN** the vector is removed from the output
