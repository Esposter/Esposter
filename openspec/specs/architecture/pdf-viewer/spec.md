# architecture/pdf-viewer Specification

## Purpose

Any PDF the app opens is drawn by its own viewer in the app's tokens: pages drawn as they come into view, moved through, zoomed, searched, downloaded and printed, and a protected one unlocked with its password.

## Requirements

### Requirement: A PDF attachment opens its viewer and keeps its document

A PDF attached to a message SHALL open its viewer from a click or the keyboard, and SHALL keep the document it has loaded when the message's read link is minted again.

#### Scenario: Opening the viewer from the keyboard

- **GIVEN** a PDF attachment in a message
- **WHEN** the reader presses Enter on its thumbnail
- **THEN** the viewer opens in a dialog titled with the file's name

#### Scenario: A re-minted link keeps the loaded document

- **GIVEN** a PDF attachment whose document has loaded
- **WHEN** the message's read link is minted again
- **THEN** the document is not loaded a second time

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

The viewer SHALL download the file under its name, carrying the reader's edits, and SHALL print every page of it.

#### Scenario: Downloading

- **GIVEN** a PDF open in the viewer
- **WHEN** the reader downloads it
- **THEN** the file is saved under the attachment's file name

#### Scenario: Downloading an edited document

- **GIVEN** a PDF whose form the reader has filled in
- **WHEN** the reader downloads it
- **THEN** the saved file carries the typed values, as the `vue-pdfjs-headless` annotations spec states

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

### Requirement: The zoom readout shows the scale and resets it to the width

The viewer SHALL show the scale as a percentage, and choosing the readout SHALL fit the pages to the width of the viewer.

#### Resetting a zoomed document

- **GIVEN** a document zoomed to 150%
- **WHEN** the reader chooses the zoom readout
- **THEN** the pages fit the width
- **AND** the readout shows the percentage the fit gives

#### Zooming out at the smallest scale

- **GIVEN** a document at the smallest scale the viewer allows
- **WHEN** the reader tries to zoom out
- **THEN** the zoom-out control is disabled

#### A readout with no document is disabled

- **GIVEN** no document loaded
- **WHEN** the toolbar is shown
- **THEN** the zoom readout is disabled

### Requirement: The search highlights every match and takes its options from the menu

The viewer SHALL highlight every match of the search, and SHALL match whole words or the case only while the menu's Whole word or Match case item is on.

#### Matching whole words

- **GIVEN** a document holding "cat" once and "cats" once
- **AND** the reader has searched for "cat"
- **WHEN** the reader turns on Whole word
- **THEN** one match is counted

#### Pressing Enter goes to the next match

- **GIVEN** a search with three matches, the viewer on the first
- **WHEN** the reader presses Enter in the search field
- **THEN** the viewer goes to the second match

### Requirement: A PDF opened with search terms highlights them

The viewer SHALL highlight every match of the terms its caller passes with the document, once the document loads.

#### Opening a PDF with search terms

- **GIVEN** a viewer given the terms "invoice" and "total"
- **WHEN** its document loads
- **THEN** every match of both terms is highlighted

#### Opening a PDF without search terms

- **GIVEN** a viewer given no terms
- **WHEN** its document loads
- **THEN** nothing is highlighted
