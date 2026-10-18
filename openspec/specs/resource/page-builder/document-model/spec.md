# resource/page-builder/document-model Specification

## Purpose

The webpage and email documents: a tree of typed nodes with unique ids, the registries that type each editor's nodes, the accessible and safe output of each webpage type, the webpage renderer, the server's strict compile of an email, and the page builder's store of open documents.

## Requirements

### Requirement: A document is a tree of typed nodes with unique ids

A webpage or an email SHALL be stored as a tree of typed nodes, each with an id unique within its document.

#### Scenario: A document with a duplicate node id is refused

- **GIVEN** a document in which two nodes share an id
- **WHEN** the owner saves the document
- **THEN** the save is refused

#### Scenario: A document over the node limit is refused

- **GIVEN** a document holding more nodes than the limit allows
- **WHEN** the owner saves the document
- **THEN** the save is refused

### Requirement: A slot accepts only the node types it allows

A node SHALL hold only the child types its slot allows.

#### Scenario: A Columns node holds only columns

- **GIVEN** a Columns node in a webpage
- **WHEN** the owner tries to place a text node directly in the Columns node
- **THEN** the text node is not placed there

#### Scenario: A survey invite sits in an email column

- **GIVEN** an email whose section holds a column
- **WHEN** the owner places a survey invite in the column
- **THEN** the invite is placed there

### Requirement: Each node type publishes accessible output

Each node type SHALL publish output that meets its accessibility contract, and SHALL refuse a document whose node breaks that contract.

#### Scenario: An image without alternative text cannot be saved

- **GIVEN** an image that has no alternative text and is not marked decorative
- **WHEN** the owner saves the document
- **THEN** the save is refused

#### Scenario: A decorative image publishes marked as decorative

- **GIVEN** an image marked decorative
- **WHEN** the webpage is published
- **THEN** the published image is marked as decorative

#### Scenario: A video without a title cannot be saved

- **GIVEN** a video with no title
- **WHEN** the owner saves the document
- **THEN** the save is refused

#### Scenario: Tabs publish as tabs that move with the arrow keys

- **GIVEN** a webpage with a Tabs node
- **WHEN** a reader focuses the tabs and presses the arrow keys
- **THEN** focus moves between the tabs

#### Scenario: Typed text stands still for a reader who prefers reduced motion

- **GIVEN** a Typed text node
- **WHEN** a reader who prefers reduced motion views the page
- **THEN** the whole text is shown without animation

#### Scenario: A countdown does not announce each tick

- **GIVEN** a published Countdown node
- **WHEN** a screen reader user is on the page while the countdown runs
- **THEN** the screen reader does not announce each tick

### Requirement: A published page runs no script and loads no unsafe link

A published webpage SHALL NOT run a script or follow a link that an unsafe address could execute, and SHALL remove unsafe markup from custom HTML.

#### Scenario: A button with a javascript link cannot be saved

- **GIVEN** a button whose link is a javascript address written with a leading space
- **WHEN** the owner saves the document
- **THEN** the save is refused

#### Scenario: Custom HTML is cleaned before it is published

- **GIVEN** a custom HTML block containing an event handler attribute
- **WHEN** the webpage is published
- **THEN** the event handler is removed
- **AND** the rest of the block's markup is kept

### Requirement: A webpage document renders as one HTML document

The webpage renderer SHALL turn a webpage document into one HTML document declaring the document's language, with each present type's structural CSS once and its content.

#### Scenario: A webpage document renders as one HTML document

- **GIVEN** a webpage document with a language and a section holding a button
- **WHEN** the document is rendered
- **THEN** the output is a single HTML document declaring that language
- **AND** the button appears inside the section

### Requirement: The server compiles an email document and refuses invalid markup

The server's compile service SHALL compile an email document to email HTML, and SHALL refuse a document whose markup fails strict validation with the validator's message.

#### Scenario: An email document with invalid markup is refused by the compile

- **GIVEN** an email document whose markup fails strict validation
- **WHEN** the server compiles it
- **THEN** the compile is refused
- **AND** the refusal carries the validator's message

#### Scenario: A valid email document compiles to email HTML

- **GIVEN** an email document whose markup passes strict validation
- **WHEN** the server compiles it
- **THEN** the result is the email's HTML

### Requirement: Each open document is held apart

The page builder's document store SHALL keep each open resource's document apart, loaded and saved through the functions its caller passes.

#### Scenario: Two open webpages keep their own documents

- **GIVEN** two webpages open in the document store
- **WHEN** one of them is edited
- **THEN** the other's document is unchanged
