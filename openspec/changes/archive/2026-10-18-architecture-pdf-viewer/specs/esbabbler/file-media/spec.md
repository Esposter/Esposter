## ADDED Requirements

### Requirement: A PDF attachment shows its first page in the message

A PDF attachment SHALL show its first page in the message row, drawn sharp at the screen's pixel density.

#### Scenario: A message with a PDF is shown

- **GIVEN** a message holds a PDF attachment
- **WHEN** the message is shown
- **THEN** the PDF's first page is drawn in the row

#### Scenario: The row changes width

- **GIVEN** a PDF's first page is drawn in a row
- **WHEN** the row's width changes
- **THEN** the page is drawn again at the new width

#### Scenario: A page larger than the device can draw

- **GIVEN** a PDF whose first page at the screen's pixel density exceeds the largest canvas the device draws
- **WHEN** the page is drawn
- **THEN** it is drawn at the largest size the device allows rather than left blank

#### Scenario: A draw cancelled by a newer one

- **GIVEN** a PDF's first page is being drawn in a row
- **WHEN** the row's width changes again before that draw ends
- **THEN** the draw in flight is cancelled and only the newer one is drawn

### Requirement: Clicking a PDF outside a preview opens its viewer

Clicking a PDF attachment outside a message preview SHALL open a dialog holding the PDF's viewer, and a preview SHALL open no viewer.

#### Scenario: Opening the viewer

- **GIVEN** a PDF attachment in a message
- **WHEN** the reader clicks its first page
- **THEN** a dialog titled with the file's name shows the PDF

#### Scenario: A preview opens nothing

- **GIVEN** a PDF attachment in a message preview
- **WHEN** the reader clicks it
- **THEN** no viewer opens

### Requirement: A PDF that fails to load never blocks its message

A PDF attachment that fails to load SHALL say so in place of its pages and SHALL NOT stop the message around it from rendering.

#### Scenario: The file cannot be fetched

- **GIVEN** a PDF attachment whose file cannot be fetched
- **WHEN** the message is shown
- **THEN** the attachment says the PDF could not be loaded
- **AND** the rest of the message renders normally
