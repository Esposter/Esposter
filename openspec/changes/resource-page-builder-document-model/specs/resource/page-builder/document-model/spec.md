## ADDED Requirements

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

#### Scenario: A video or map without a title cannot be saved

- **GIVEN** a video or map with no title
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

### Requirement: A published webpage is one HTML document

Publishing a webpage SHALL produce one HTML document holding its language, its theme, its styles and its content.

#### Scenario: A published webpage is one HTML document

- **GIVEN** a webpage with a language, theme colours and styled nodes
- **WHEN** the webpage is published
- **THEN** a reader receives a single HTML document
- **AND** the document declares the webpage's language
- **AND** the document holds the webpage's theme and styles

### Requirement: Publishing an email compiles its markup and refuses invalid markup

Publishing an email SHALL compile the email to email HTML on the server and SHALL refuse an email whose markup fails strict validation.

#### Scenario: An email with invalid markup is refused at publish

- **GIVEN** an email whose markup fails strict validation
- **WHEN** the owner publishes the email
- **THEN** the publish is refused
- **AND** the refusal shows the validator's message

#### Scenario: A valid email publishes its compiled HTML

- **GIVEN** an email whose markup passes strict validation
- **WHEN** the owner publishes the email
- **THEN** a reader receives the email's compiled HTML

### Requirement: A survey invite links its survey

A survey invite in a webpage or an email SHALL link its survey, so that deleting the survey warns about the page that holds the invite.

#### Scenario: Deleting a surveyed invite's survey names the webpage

- **GIVEN** a webpage with a survey invite for a survey
- **WHEN** the owner deletes the survey
- **THEN** the delete warning names the webpage

### Requirement: A webpage exports as one HTML file

A webpage SHALL export as one self-contained HTML file showing the page as published.

#### Scenario: Exporting a webpage downloads one HTML file

- **GIVEN** a webpage open in the editor
- **WHEN** the owner chooses Export
- **THEN** one HTML file downloads
- **AND** the file shows the webpage without needing any other file
