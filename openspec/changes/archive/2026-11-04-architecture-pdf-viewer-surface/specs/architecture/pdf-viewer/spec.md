## RENAMED Requirements

- FROM: ### Requirement: The reader can move through, zoom and rotate a PDF
- TO: ### Requirement: The reader can move through and zoom a PDF

## MODIFIED Requirements

### Requirement: The reader can move through and zoom a PDF

The viewer SHALL let the reader go to any page, zoom in and out, fit a page to the view, and show it at actual size.

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

The viewer SHALL find text in the PDF, highlight every match, step to the previous and next match, and show how many matches there are.

#### Scenario: Searching for a word

- **GIVEN** a PDF open in the viewer
- **WHEN** the reader searches for a word the PDF holds
- **THEN** the first match is highlighted and scrolled into view
- **AND** the number of matches is shown

#### Scenario: Searching for a word the PDF does not hold

- **GIVEN** a PDF open in the viewer
- **WHEN** the reader searches for a word the PDF does not hold
- **THEN** the viewer says nothing was found

#### Scenario: Pressing Enter goes to the next match

- **GIVEN** a search with three matches, the viewer on the first
- **WHEN** the reader presses Enter in the search field
- **THEN** the viewer goes to the second match

#### Scenario: Opening a PDF with search terms

- **GIVEN** a viewer given the terms "invoice" and "total"
- **WHEN** its document loads
- **THEN** every match of both terms is highlighted

#### Scenario: Opening a PDF without search terms

- **GIVEN** a viewer given no terms
- **WHEN** its document loads
- **THEN** nothing is highlighted

## REMOVED Requirements

### Requirement: The search highlights every match and takes its options from the menu

Its highlighting is the search requirement's, and its Enter scenario is that requirement's too. Its options are the new requirement below.

### Requirement: A PDF opened with search terms highlights them

Its scenarios are scenarios of the search requirement, which owns the highlighting of every match.

## ADDED Requirements

### Requirement: The search's options come from the menu

The viewer SHALL match whole words or the case only while the menu's Whole word or Match case item is on.

#### Scenario: Matching whole words

- **GIVEN** a document holding "cat" once and "cats" once
- **AND** the reader has searched for "cat"
- **WHEN** the reader turns on Whole word
- **THEN** one match is counted

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

### Requirement: At a phone's width the sidebar overlays the pages

The viewer SHALL draw the sidebar over the pages at a phone's width rather than beside them, so the pages keep the whole width.

#### The sidebar covers the pages on a phone

- **GIVEN** a phone-width screen with the sidebar open
- **WHEN** the reader looks at the pages
- **THEN** the sidebar covers the start edge of the pages
- **AND** the pages keep the full width of the viewer
