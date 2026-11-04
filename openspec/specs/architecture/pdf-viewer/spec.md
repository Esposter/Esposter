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

### Requirement: The sidebar lists the outline or the thumbnails

The viewer SHALL show one sidebar, opened and closed from the toolbar, whose two tabs choose between the outline and the thumbnails, and SHALL remember the reader's open or closed choice and tab in the browser.

#### Switching the sidebar between the outline and the thumbnails

- **GIVEN** a sidebar open on the outline
- **WHEN** the reader chooses the Thumbnails tab
- **THEN** the thumbnails are listed
- **AND** the outline is not listed

#### A wide screen starts with the sidebar open

- **GIVEN** a screen wider than a phone and no choice remembered in the browser
- **WHEN** the viewer opens
- **THEN** the sidebar is open

#### A phone starts with the sidebar closed

- **GIVEN** a phone-width screen and no choice remembered in the browser
- **WHEN** the viewer opens
- **THEN** the sidebar is closed

#### The reader's sidebar choice is remembered

- **GIVEN** the reader has closed the sidebar on the Thumbnails tab
- **WHEN** a viewer opens later in the same browser
- **THEN** the sidebar is closed
- **AND** the Thumbnails tab is chosen when the sidebar is opened

### Requirement: An outline entry goes to its page

The viewer SHALL go to an outline entry's destination when the reader chooses it, and SHALL list each nested entry under its parent, indented.

#### Following an outline entry

- **GIVEN** an outline whose entry points at its third page
- **WHEN** the reader chooses that entry
- **THEN** the viewer shows the third page

#### A nested entry sits under its parent

- **GIVEN** an outline entry "Chapter 1" with a nested entry "Section 1.1"
- **WHEN** the outline is listed
- **THEN** "Section 1.1" is listed after "Chapter 1" and indented beneath it

#### A document with no outline says so

- **GIVEN** a document with no outline
- **WHEN** its outline is listed
- **THEN** the sidebar says the document has no outline

#### An outline still being read is loading

- **GIVEN** a document whose outline is still being read
- **WHEN** the outline is listed
- **THEN** placeholder rows are shown in place of the empty text

### Requirement: A thumbnail goes to its page and marks the page in view

The viewer SHALL show a card for each page in the thumbnails, go to a page when its card is chosen, and mark the card of the page in view as current.

#### Choosing a thumbnail

- **GIVEN** a document of six pages
- **WHEN** the reader chooses the card of the fourth page
- **THEN** the viewer shows the fourth page

#### The page in view is marked

- **GIVEN** the viewer on its second page
- **WHEN** the thumbnails are listed
- **THEN** the card of the second page is marked as current
- **AND** no other card is marked as current

#### A thumbnail not yet drawn holds its place

- **GIVEN** a page whose thumbnail has not been drawn
- **WHEN** its card is listed
- **THEN** the card shows a placeholder with its page number

### Requirement: The reader rotates the pages a quarter turn

The viewer SHALL turn every page a quarter turn left or right from the menu, and the thumbnails SHALL turn with the pages.

#### Rotating right

- **GIVEN** pages at their upright rotation
- **WHEN** the reader chooses Rotate right
- **THEN** the pages and their thumbnails are turned a quarter turn clockwise

#### Rotating left

- **GIVEN** pages at their upright rotation
- **WHEN** the reader chooses Rotate left
- **THEN** the pages and their thumbnails are turned a quarter turn counter-clockwise

#### Four quarter turns return the pages upright

- **GIVEN** pages turned a quarter turn clockwise three times
- **WHEN** the reader chooses Rotate right once more
- **THEN** the pages are upright again

### Requirement: The reader views the whole viewer full screen

The viewer SHALL fill the screen with the whole viewer, its toolbar and sidebar included, from the menu's Full screen item, which reads Exit full screen while the viewer is full screen.

#### Entering full screen

- **GIVEN** the viewer not full screen
- **WHEN** the reader chooses Full screen
- **THEN** the whole viewer fills the screen
- **AND** the menu item reads Exit full screen

#### Leaving full screen with Escape

- **GIVEN** the viewer full screen
- **WHEN** the reader presses Escape
- **THEN** the menu item reads Full screen again

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

### Requirement: The reader downloads a copy with a watermark

The viewer SHALL ask for the watermark text in a small dialog, and SHALL download the document with that text on every page, without the pages on screen showing it.

#### Downloading with a watermark

- **GIVEN** a PDF open in the viewer
- **WHEN** the reader enters "DRAFT" in the watermark dialog and chooses Download
- **THEN** a file under the attachment's name is saved with DRAFT on every page
- **AND** the pages on screen do not show DRAFT

#### An empty watermark cannot be downloaded

- **GIVEN** the watermark dialog open with no text entered
- **WHEN** the reader looks at its Download action
- **THEN** the action is disabled

#### Cancelling the watermark dialog saves nothing

- **GIVEN** the watermark dialog open with text entered
- **WHEN** the reader chooses Cancel
- **THEN** no file is saved

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

### Requirement: At a phone's width the sidebar overlays the pages

The viewer SHALL draw the sidebar over the pages at a phone's width rather than beside them, so the pages keep the whole width.

#### The sidebar covers the pages on a phone

- **GIVEN** a phone-width screen with the sidebar open
- **WHEN** the reader looks at the pages
- **THEN** the sidebar covers the start edge of the pages
- **AND** the pages keep the full width of the viewer
