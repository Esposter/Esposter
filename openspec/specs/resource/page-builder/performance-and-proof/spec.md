# resource/page-builder/performance-and-proof Specification

## Purpose

The page builder's performance targets and the proof of its output: each editor's render, edit and compile numbers, and the checks that its output matches the published page.

## Requirements

### Requirement: An editor makes no request to a third-party origin of its own

An editor SHALL make no request to a third-party origin, except for content the owner adds.

#### Scenario: Opening an editor requests no third-party origin

- **GIVEN** an owner who opens a webpage editor
- **WHEN** the editor finishes loading
- **THEN** no request is made to an origin outside the app

### Requirement: Rendering a large document renders every node

A document of 2,000 nodes SHALL render every node to HTML, in document order.

#### Scenario: Rendering a large document renders every node

- **GIVEN** a webpage document of 2,000 nodes, each with its own text
- **WHEN** the document is rendered to HTML
- **THEN** every node's text appears in the HTML once, in document order

### Requirement: A single edit changes only the node it names

One edit SHALL change only the node its path names in a 2,000-node document.

#### Scenario: A single edit changes only the node it names

- **GIVEN** a document of 2,000 nodes
- **WHEN** one edit is applied
- **THEN** the named node holds the edit's value and every other node is unchanged

### Requirement: An edit's recorded inverse restores the document exactly

Applying an edit's recorded inverse SHALL restore the document exactly.

#### Scenario: An edit's inverse restores the document exactly

- **GIVEN** a document of 2,000 nodes and one applied edit
- **WHEN** the edit's recorded inverse is applied
- **THEN** the document equals the document before the edit

### Requirement: An edit shows on the canvas

A prop or style edit in a document open in the editor SHALL show on the canvas.

#### Scenario: An edit shows on the canvas

- **GIVEN** a document open in the editor
- **WHEN** the owner changes a prop or a style
- **THEN** the change shows on the canvas

### Requirement: A selection change shows its outline

A selection change SHALL show its outline on the canvas.

#### Scenario: Selecting a node outlines it

- **GIVEN** a document open in the editor
- **WHEN** the owner selects a node
- **THEN** the selection outline is drawn around that node

### Requirement: The starter email compiles under strict validation

The starter email SHALL read back as an email and compile on the server under strict validation.

#### Scenario: The starter email compiles under strict validation

- **GIVEN** the starter email
- **WHEN** it is compiled on the server
- **THEN** it compiles to HTML with no validation error

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

Each node type's published output SHALL match its expected output for every edge value of its props.

#### Scenario: A type's output matches for every edge value

- **GIVEN** a node type and a fixture for each edge value of its props
- **WHEN** the type's output is produced for each fixture
- **THEN** each output equals its expected output

### Requirement: Hostile markup is removed from raw HTML

Hostile markup SHALL be removed from raw HTML.

#### Scenario: A hostile markup vector in custom HTML is removed

- **GIVEN** custom HTML containing a hostile markup vector
- **WHEN** the block's output is produced
- **THEN** the vector is removed from the output

### Requirement: Every string and array in a document's input is bounded, or is named as opaque

A procedure whose input holds a resource-owned document SHALL bound every string and array outside that document, and the bounds guard SHALL fail on an unbounded string or array anywhere in the input except inside the opaque subschema it names.

#### Scenario: An unbounded string beside an opaque document fails the guard

- **GIVEN** a procedure whose input is an opaque document alongside a plain string with no length limit
- **WHEN** the bounds guard runs over that procedure
- **THEN** the guard reports the plain string's path

### Requirement: The starter document's own strings carry length limits

The starter document's own strings SHALL carry length limits in the shared schema, so the email and webpage procedures pass the guard without an opaque exemption that hides the document's fields.

#### Scenario: The MJML root's strings are bounded

- **GIVEN** the email compile input with its MJML root's language, preview and title, and its attribute and body strings
- **WHEN** the bounds guard runs over `email.compile`
- **THEN** no unbounded path is reported for the document's own fields
