# vue-pdfjs-headless/viewer Specification

## Purpose

TBD - created by archiving change architecture-pdf-viewer-package. Update Purpose after archive.

## Requirements

### Requirement: A page is drawn sharp within the device's canvas

The package SHALL draw a page at its canvas's width times the device's pixel ratio, reduced to the largest canvas area a device draws.

#### Scenario: A page drawn on a high-density screen

- **GIVEN** a screen with a pixel ratio of two
- **WHEN** a page is drawn into a canvas
- **THEN** the canvas holds twice as many pixels across as its width on screen

#### Scenario: A page too large for the device's canvas

- **GIVEN** a page whose sharp size is over the largest canvas area
- **WHEN** it is drawn
- **THEN** it is drawn at the largest scale within that area, not left blank

### Requirement: The newest draw of a page wins

The package SHALL draw a page again when its canvas changes width, cancelling any draw still running.

#### Scenario: A width change while a page is drawing

- **GIVEN** a page still drawing
- **WHEN** its canvas changes width
- **THEN** the running draw is cancelled
- **AND** the page shows only the draw at the new width

### Requirement: Each rendered page is given for overlays

The package SHALL give the consumer each rendered page's element and its viewport, which converts a rectangle on the page to the screen.

#### Scenario: Placing an overlay on a page

- **GIVEN** a document open in the viewer
- **WHEN** its second page is rendered
- **THEN** the consumer receives that page's element and viewport

#### Scenario: Highlighting an area of a page

- **GIVEN** a rectangle in a page's own coordinates
- **WHEN** it is converted with that page's viewport
- **THEN** the rectangle lands over the same area on screen at every zoom

### Requirement: Zoom stays within the renderer's bounds

The package SHALL zoom in steps, to fit, and by pinch or Ctrl with the wheel about the pointer, never past the renderer's smallest or largest scale.

#### Scenario: Zooming in at the largest scale

- **GIVEN** a document at the renderer's largest scale
- **WHEN** the reader zooms in
- **THEN** the scale stays at the largest
- **AND** zooming in is reported as unavailable

#### Scenario: Fitting a page to the width

- **GIVEN** a document open in the viewer
- **WHEN** the reader fits it to the width
- **THEN** a page fills the container's width

#### Scenario: Pinching to zoom

- **GIVEN** two pointers on the viewer's container
- **WHEN** they move apart
- **THEN** the document zooms in
- **AND** the point between them stays under them

### Requirement: Search counts and highlights its matches

The package SHALL search the document's text, reporting the number of matches and highlighting each one.

#### Scenario: Searching for a word shows the match count

- **GIVEN** a document holding a word three times
- **WHEN** the reader searches for it
- **THEN** three matches are reported and highlighted

#### Scenario: A word that is not in the document

- **GIVEN** a document that does not hold a word
- **WHEN** the reader searches for it
- **THEN** no matches are reported

#### Scenario: Highlighting a list of terms on load

- **GIVEN** a list of two terms passed with the document
- **WHEN** the document loads
- **THEN** every match of both terms is highlighted

### Requirement: The outline and thumbnails navigate

The package SHALL give the document's outline as bookmarks and draw a page's thumbnail once its row is in view, marking the current page.

#### Scenario: Following a bookmark

- **GIVEN** a document whose outline points at its third page
- **WHEN** the reader follows that entry
- **THEN** the viewer shows the third page

#### Scenario: A document with no outline

- **GIVEN** a document with no outline
- **WHEN** it loads
- **THEN** the bookmarks are empty

#### Scenario: The thumbnail sidebar marks the current page

- **GIVEN** a sidebar of thumbnails beside the viewer
- **WHEN** the reader scrolls to the second page
- **THEN** the second thumbnail is marked as current
- **AND** a thumbnail out of view is not drawn

### Requirement: Fullscreen follows the browser

The package SHALL enter fullscreen on the consumer's container and report whether it is fullscreen as the browser changes it.

#### Scenario: Leaving fullscreen with the Escape key

- **GIVEN** the viewer in fullscreen
- **WHEN** the reader presses Escape
- **THEN** the viewer reports that it is no longer fullscreen

### Requirement: A document downloads and prints

The package SHALL download a document under its file name and print every page within the device's canvas.

#### Scenario: Downloading a document under its name

- **GIVEN** a document loaded from a file named "report.pdf"
- **WHEN** the reader downloads it
- **THEN** a file named "report.pdf" holding the document's bytes is saved

#### Scenario: Printing a document

- **GIVEN** a document of three pages
- **WHEN** the reader prints it
- **THEN** all three pages are drawn for print, each within the largest canvas area

#### Scenario: Unmounting while a print is drawing

- **GIVEN** a print still drawing its pages
- **WHEN** the viewer unmounts
- **THEN** the print stops and leaves no page or print style behind
