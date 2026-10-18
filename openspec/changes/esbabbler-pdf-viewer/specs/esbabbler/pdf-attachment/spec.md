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

### Requirement: The viewer draws only the pages in view

The viewer SHALL draw only the pages the reader can see, so a long document opens without drawing every page.

#### Scenario: Opening a long document

- **GIVEN** a PDF of many pages
- **WHEN** the viewer opens it
- **THEN** only the pages in view are drawn
- **AND** scrolling draws each page as it comes into view

### Requirement: The reader can move through, zoom and rotate a PDF

The viewer SHALL let the reader go to any page, zoom in and out, fit the page to the width or to the view, show it at actual size, and rotate it.

#### Scenario: Going to a page

- **GIVEN** a PDF open in the viewer
- **WHEN** the reader enters a page number
- **THEN** that page is scrolled into view

#### Scenario: Zooming past the largest scale

- **GIVEN** a PDF shown at the largest scale the viewer allows
- **WHEN** the reader tries to zoom in
- **THEN** the scale stays where it is
- **AND** the zoom-in control is disabled

### Requirement: The reader can search a PDF's text

The viewer SHALL find text in the PDF, with options to match case and whole words, step to the previous and next match, and show how many matches there are.

#### Scenario: Searching for a word

- **GIVEN** a PDF open in the viewer
- **WHEN** the reader searches for a word the PDF holds
- **THEN** the first match is highlighted and scrolled into view
- **AND** the number of matches is shown

#### Scenario: Searching for a word the PDF does not hold

- **GIVEN** a PDF open in the viewer
- **WHEN** the reader searches for a word the PDF does not hold
- **THEN** the viewer says nothing was found

### Requirement: The reader can download and print a PDF

The viewer SHALL download the original file under its name, and SHALL print every page of it.

#### Scenario: Downloading

- **GIVEN** a PDF open in the viewer
- **WHEN** the reader downloads it
- **THEN** the original file is saved under the attachment's file name

#### Scenario: Printing

- **GIVEN** a PDF of several pages open in the viewer
- **WHEN** the reader prints it
- **THEN** every page is printed, one to a sheet

### Requirement: A protected PDF asks for its password

The viewer SHALL ask for the password of a password-protected PDF, and SHALL say when the password given is wrong.

#### Scenario: The right password

- **GIVEN** a password-protected PDF
- **WHEN** the reader opens it and enters its password
- **THEN** the PDF is shown

#### Scenario: A wrong password

- **GIVEN** a password-protected PDF
- **WHEN** the reader enters a wrong password
- **THEN** the viewer says the password is wrong
- **AND** asks again

### Requirement: A PDF that fails to load never blocks its message

A PDF attachment that fails to load SHALL say so in place of its pages and SHALL NOT stop the message around it from rendering.

#### Scenario: The file cannot be fetched

- **GIVEN** a PDF attachment whose file cannot be fetched
- **WHEN** the message is shown
- **THEN** the attachment says the PDF could not be loaded
- **AND** the rest of the message renders normally

### Requirement: Every reported issue of the upstream wrappers has a recorded verdict

Every reported issue of both upstream PDF wrappers SHALL have a recorded verdict, and each in-scope defect SHALL have a regression check or a construction that rules it out.

#### Scenario: An in-scope defect is checked

- **GIVEN** an upstream defect that the PDF attachment fixes
- **WHEN** the test suite runs
- **THEN** a regression check names that issue
- **AND** the check fails against the upstream behaviour
