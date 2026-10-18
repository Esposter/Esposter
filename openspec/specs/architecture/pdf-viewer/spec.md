# architecture/pdf-viewer Specification

## Purpose

Any PDF the app opens is drawn by its own viewer in the app's tokens: pages drawn as they come into view, moved through, zoomed, searched, downloaded and printed, and a protected one unlocked with its password.

## Requirements

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
