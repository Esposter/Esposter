# vue-pdfjs-headless/viewer Specification

## Purpose

A loaded PDF's drawing and the viewer's state as the headless package `vue-pdfjs-headless` states them: sharp pages, zoom within bounds, search, the outline and thumbnails, rotation, download and print, with no styling and no controls of its own.

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

### Requirement: Zoom stays within the package's bounds

The package SHALL zoom in steps, to fit, and by pinch or Ctrl with the wheel about the pointer, never past the package's smallest or largest scale, and SHALL return the scale to the one a document opens in on reset.

#### Scenario: Zooming in at the largest scale

- **GIVEN** a document at the renderer's largest scale
- **WHEN** the reader zooms in
- **THEN** the scale stays at the largest
- **AND** zooming in is reported as unavailable

#### Scenario: Zooming out at the smallest scale

- **GIVEN** a document at the renderer's smallest scale
- **WHEN** the reader tries to zoom out
- **THEN** the scale stays at the smallest
- **AND** zooming out is reported as unavailable

#### Scenario: Fitting a page to the width

- **GIVEN** a document open in the viewer
- **WHEN** the reader fits it to the width
- **THEN** a page fills the container's width

#### Scenario: Opening a document fitted to the container

- **GIVEN** a viewer on a narrow container
- **WHEN** a document loads
- **THEN** its pages are fitted to the container

#### Scenario: Zooming in past the largest scale stops at the package's maximum

- **GIVEN** a document at a scale of 9.1
- **WHEN** the reader zooms in
- **THEN** the scale is the package's largest scale

#### Scenario: The zoom reset returns to the scale a document opens in

- **GIVEN** a document zoomed away from the scale it opened in
- **WHEN** the reader resets the zoom
- **THEN** the viewer's scale is the scale it opened in

#### Scenario: Pinching to zoom

- **GIVEN** two pointers on the viewer's container
- **WHEN** they move apart
- **THEN** the document zooms in
- **AND** the point between them stays under them

### Requirement: Rotation turns every page a quarter turn

The package SHALL turn every page a quarter turn clockwise or counter-clockwise on each rotate, wrapping after a full turn in either direction.

#### Scenario: Rotating a document

- **GIVEN** a document open in the viewer, unrotated
- **WHEN** the reader rotates it a quarter turn clockwise
- **THEN** every page is turned a quarter turn
- **AND** the viewer reports the new rotation

#### Scenario: Rotating counter-clockwise

- **GIVEN** a document open in the viewer, unrotated
- **WHEN** the reader rotates it a quarter turn counter-clockwise
- **THEN** every page is turned a quarter turn counter-clockwise

#### Scenario: Rotating past a full turn

- **GIVEN** a document turned three quarters
- **WHEN** the reader rotates it again
- **THEN** the pages are back at no rotation

#### Scenario: A page's own quarter turn is kept under the viewer's turn

- **GIVEN** a page whose own rotation is a quarter turn
- **WHEN** the viewer's rotation is a quarter turn
- **THEN** the page is drawn at half a turn, the sum of the two

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

#### Scenario: Highlighting the terms a document opens with

- **GIVEN** a viewer given the terms "word" and "page"
- **WHEN** its document loads
- **THEN** the search query is "word page"
- **AND** the matches of that query are highlighted

#### Scenario: A document that replaces another starts with no search

- **GIVEN** a document with a search query and matches
- **WHEN** another document replaces it
- **THEN** the search query is empty
- **AND** the match count is zero of zero

### Requirement: The outline and thumbnails navigate

The package SHALL give the document's outline as bookmarks and load and draw a page's thumbnail once its row is in view, marking the current page.

#### Scenario: Following a bookmark

- **GIVEN** a document whose outline points at its third page
- **WHEN** the reader follows that entry
- **THEN** the viewer shows the third page

#### Scenario: A document with no outline

- **GIVEN** a document with no outline
- **WHEN** it loads
- **THEN** the bookmarks are empty

#### Scenario: An outline still being read

- **GIVEN** a document whose outline is still being read
- **WHEN** the reader looks at the bookmarks
- **THEN** the bookmarks are not yet known, rather than empty

#### Scenario: An outline that cannot be read

- **GIVEN** a document whose outline cannot be read
- **WHEN** it loads
- **THEN** the bookmarks are empty
- **AND** the failure is logged

#### Scenario: An outline read for a replaced document

- **GIVEN** a document whose outline is still being read
- **WHEN** another document is opened before that read finishes
- **THEN** the first document's outline is not shown

#### Scenario: The thumbnail sidebar marks the current page

- **GIVEN** a sidebar of thumbnails beside the viewer
- **WHEN** the reader scrolls to the second page
- **THEN** the second thumbnail is marked as current
- **AND** a thumbnail out of view is neither loaded nor drawn

#### Scenario: A drawn thumbnail turns with the pages

- **GIVEN** a thumbnail already drawn in the sidebar
- **WHEN** the document is rotated a quarter turn
- **THEN** the thumbnail is drawn turned with its page

#### Scenario: The rows are in view of the sidebar once it mounts, not of the viewport

- **GIVEN** a document whose thumbnails are listed before the sidebar's element exists
- **WHEN** the sidebar's element mounts
- **THEN** the rows are watched against the sidebar's element, not the viewport

### Requirement: A document downloads and prints

The package SHALL download a document under its file name, with a watermark on every page when the consumer gives one for that download, and print every page within the device's canvas.

#### Scenario: Downloading a document under its name

- **GIVEN** a document loaded from a file named "report.pdf"
- **WHEN** the reader downloads it
- **THEN** a file named "report.pdf" holding the document's bytes is saved

#### Scenario: Downloading with a watermark

- **GIVEN** a document loaded from a file named "report.pdf"
- **WHEN** the reader downloads it with a watermark
- **THEN** a file named "report.pdf" is saved with the watermark on every page, as the annotations spec states

#### Scenario: Printing a document

- **GIVEN** a document of three pages
- **WHEN** the reader prints it
- **THEN** all three pages are drawn for print, each within the largest canvas area

#### Scenario: Unmounting while a print is drawing

- **GIVEN** a print still drawing its pages
- **WHEN** the viewer unmounts
- **THEN** the print stops and leaves no page or print style behind
