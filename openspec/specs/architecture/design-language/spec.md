## Purpose

How every interface in the app is drawn — the palette tokens and how a theme reaches the first response, the design styles a reader switches between, the layout tier of steps and motion, the surfaces as UnoCSS rules, the four type rules, the colour and state rules, and the document chrome every page takes.

## Requirements

### Requirement: Every interface is drawn from one shared set of colour tokens

Every interface SHALL be drawn from one shared set of colour tokens, so every design style and mode answers to the same token names.

#### Scenario: A theme switch changes colour values but not token names

- **GIVEN** the reader switches between light and dark, or between design styles
- **WHEN** a component draws a colour
- **THEN** it takes the colour from the same token name in every case

#### Scenario: A feature names a token rather than a fixed colour

- **GIVEN** a feature needs a colour
- **WHEN** the feature is drawn
- **THEN** it names a token rather than a fixed colour value

### Requirement: Every text colour meets the AA contrast threshold on every surface

Every text colour token SHALL meet the WCAG AA contrast threshold on every surface colour token in every palette.

#### Scenario: A palette change that drops a text colour below the threshold fails the palette test

- **GIVEN** a palette value is changed
- **WHEN** the palette test runs
- **THEN** any text colour below the AA threshold on any surface fails the test

### Requirement: A status is shown with a mark or word as well as its colour

A status SHALL be shown with its colour and a mark or a word, never by colour alone.

#### Scenario: An error can be told apart without colour

- **GIVEN** an error is shown to the reader
- **WHEN** a reader who cannot tell red from green sees it
- **THEN** the error is still identified by its mark or word

### Requirement: A link is drawn in the info colour and underlined on hover

A link SHALL be drawn in the info colour and underlined while hovered.

#### Scenario: Hovering a link underlines it

- **GIVEN** a link is on screen
- **WHEN** the reader hovers it
- **THEN** the link is underlined

### Requirement: The app offers three design styles that never move the layout

The app SHALL offer three design styles, and switching between them SHALL NOT move any control.

#### Scenario: Switching style leaves every control in place

- **GIVEN** the reader is on a page
- **WHEN** the reader switches design style
- **THEN** every control keeps its size and place

#### Scenario: The chosen style is used on the first response

- **GIVEN** the reader has chosen a design style
- **WHEN** the reader reloads the app
- **THEN** the first response already uses the chosen style

#### Scenario: A reader with no style or an unknown style gets the standard style

- **GIVEN** the reader has no style chosen, or a style the app does not offer
- **WHEN** a page loads
- **THEN** the standard style is used

### Requirement: A design style changes drawing and never size, spacing or position

A design style SHALL change how surfaces are drawn, and SHALL NOT change their size, spacing or position.

#### Scenario: Each style gives every control the same size and spacing

- **GIVEN** a page is laid out in each of the three styles
- **WHEN** the layouts are compared
- **THEN** every control has the same size and spacing in all three

### Requirement: A feature's own code never chooses a design style

A feature's own code SHALL NOT choose a design style, so any difference in look is drawn by the shared component library.

#### Scenario: A feature that needs a different look gets it from the library

- **GIVEN** a feature needs a different look for one of its controls
- **WHEN** the control is drawn
- **THEN** the shared component library draws the difference

#### Scenario: A feature that names a style-specific detail fails the check

- **GIVEN** a feature names a style-specific detail in its own markup
- **WHEN** the repository's checks run
- **THEN** the check fails

### Requirement: A region can pin its own mode and style

A region SHALL be able to pin its own mode and style, and it SHALL draw in them wherever it sits on the page.

#### Scenario: The agent console keeps the Genshin style on any page

- **GIVEN** the agent console is open inside a page in the standard style
- **WHEN** its panels are drawn
- **THEN** the panels draw in the Genshin style

### Requirement: The standard style separates surfaces by tone rather than outline

Standard SHALL separate surfaces by tone, not by outline.

#### Scenario: A panel stands out by its tone without an outline

- **GIVEN** a panel sits on the page in the standard style
- **WHEN** the panel is shown
- **THEN** it has no outline
- **AND** it stands out from the page by its tone

### Requirement: Every focused control shows a visible focus indicator

Every focused control SHALL show a visible focus indicator that a keyboard reader can follow.

#### Scenario: A focused button shows an outline

- **GIVEN** a keyboard reader moves focus to a button
- **WHEN** the button is focused
- **THEN** an outline shows around the button

#### Scenario: A focused text field shows a tint instead of an outline

- **GIVEN** a keyboard reader moves focus to a text field
- **WHEN** the field is focused
- **THEN** the field is shown with a tint
- **AND** no outline is drawn around the field

### Requirement: Text uses four sizes, each set by the design style

The interface SHALL draw text in four sizes — body, section heading, page title and display — each set by the design style.

#### Scenario: Readable text swaps the pixel face for the system faces

- **GIVEN** the reader has turned readable text on in the pixel style
- **WHEN** a page is drawn
- **THEN** the body, headings and code use the system faces

#### Scenario: Pixel headings keep their hierarchy when the reader scales text

- **GIVEN** the reader scales text in the pixel style
- **WHEN** a heading is drawn
- **THEN** it keeps the accent colour and a larger size than the body

### Requirement: Every transition eases and is removed for reduced motion

Every transition SHALL ease into place rather than step, and SHALL take no time for a reader who asks for reduced motion.

#### Scenario: A dialog eases in from its origin

- **GIVEN** the reader opens a dialog
- **WHEN** the dialog appears
- **THEN** it eases in from where it was opened

#### Scenario: Reduced motion makes transitions instant

- **GIVEN** the reader has asked for reduced motion
- **WHEN** a transition would play
- **THEN** it happens at once

### Requirement: Menus, selects and suggestion lists open without motion

Menus, selects and suggestion lists SHALL open without motion.

#### Scenario: A menu appears at once

- **GIVEN** the reader opens a menu
- **WHEN** the menu appears
- **THEN** it appears without any animation

### Requirement: Surfaces keep a visible outline under forced colours

Under the forced-colours setting every surface SHALL keep a visible outline.

#### Scenario: A frame, button or field keeps its outline in forced colours

- **GIVEN** the reader's system forces colours
- **WHEN** a frame, a button or a field is shown
- **THEN** it keeps a visible outline

### Requirement: A printed page prints as a document

A printed page SHALL print as a document, with dark text on white and surfaces without fills.

#### Scenario: Printing hides the dock and the dialog scrim

- **GIVEN** the reader prints a page
- **WHEN** the print is produced
- **THEN** the text is dark on white
- **AND** the dock and any dialog scrim are hidden

#### Scenario: A link in running text prints its address

- **GIVEN** a link appears in running text on the page
- **WHEN** the page is printed
- **THEN** the link's address is printed after it

### Requirement: Touch targets are at least 44 pixels under a coarse pointer

Under a coarse pointer every button SHALL be at least 44 pixels square, and every list row and tab SHALL be at least 44 pixels tall.

#### Scenario: A button is large enough to tap with a finger

- **GIVEN** the reader uses a touch screen
- **WHEN** a button is shown
- **THEN** its target is at least 44 pixels square

### Requirement: Chart series are told apart by marker shape as well as colour

Each chart series SHALL be told apart by its marker shape as well as by its colour.

#### Scenario: A chart's series remain distinct without colour

- **GIVEN** a chart shows several series
- **WHEN** the reader cannot tell the colours apart
- **THEN** each series is still identified by its own marker shape
