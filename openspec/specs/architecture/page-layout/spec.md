## Purpose

How a page is laid out from its route to its pixels — the layout it picks, the shell grid of drawers and page, what changes with the width and the height, and which part draws each surface, so no page paints a background or places a region of its own.

## Requirements

### Requirement: A page fills its layout's slots and paints nothing of its own

A page SHALL be laid out by the layout it picks and SHALL only fill that layout's slots, and it SHALL NOT paint its own background or open a drawer by hand.

#### Scenario: A list needs to read as a panel

- **GIVEN** a page holds a list that should read as a panel
- **WHEN** the page is laid out
- **THEN** the list is placed in a drawer or a region that draws its own frame
- **AND** the page itself paints no background

#### Scenario: A page has no drawers

- **GIVEN** a page declares no drawers
- **WHEN** it is laid out
- **THEN** the page occupies a single column

### Requirement: Drawers dock on a wide screen and become sheets on a narrow one

On a wide screen every drawer a page has SHALL be docked open, and on a narrow screen every drawer SHALL stay closed until a button opens it as a sheet.

#### Scenario: A reader opens the app on a wide screen

- **GIVEN** the screen is at least the large breakpoint
- **WHEN** the page loads
- **THEN** every drawer the page has is docked open beside the page

#### Scenario: A reader opens a drawer on a narrow screen

- **GIVEN** the screen is narrower than the large breakpoint
- **WHEN** the reader activates the drawer's button in the page header
- **THEN** the drawer opens as a sheet from its own side

#### Scenario: A reader picks a page from inside a sheet

- **GIVEN** a drawer sheet is open on a narrow screen
- **WHEN** the reader picks a page from inside it
- **THEN** the sheet closes

### Requirement: The wide or narrow layout is decided after the page mounts

The layout SHALL decide between wide and narrow only after the page has mounted, so the first render never assumes a screen size.

#### Scenario: A page is first rendered by the server

- **GIVEN** the page is rendered on the server, which has no screen
- **WHEN** the page is first shown
- **THEN** it renders narrow
- **AND** the layout switches to the reader's real width once the page has mounted

### Requirement: A drawer shows one title

A drawer SHALL show one title, either the sheet's title bar or the title its own content draws, and never both.

#### Scenario: A room pane draws its own header

- **GIVEN** a drawer's content already draws its own title and close button
- **WHEN** the drawer opens as a sheet on a narrow screen
- **THEN** the sheet shows no second title bar and no second close button
- **AND** the sheet keeps its title as its accessible name

### Requirement: A page scrolls the window unless it declares a viewport-height layout

A page SHALL scroll the window by default, and a page that declares a viewport-height layout SHALL fill exactly the viewport and scroll only inside its own regions.

#### Scenario: A standard page is read

- **GIVEN** a page uses the default height
- **WHEN** the reader scrolls
- **THEN** the window scrolls and the browser's scroll restoration and find-in-page keep working

#### Scenario: A page that scrolls inside its regions is shown

- **GIVEN** a page declares a viewport-height layout
- **WHEN** the page is shown
- **THEN** the page is exactly the viewport tall
- **AND** its scrolling content scrolls inside its own column

### Requirement: An immersive page never scrolls the window

An immersive page SHALL fill exactly the viewport, and the window SHALL NOT scroll behind it even when something else adds content to the page.

#### Scenario: A browser extension adds an element to the page

- **GIVEN** an immersive page is shown
- **WHEN** an extension appends an element after the app
- **THEN** no window scrollbar appears beside the page

### Requirement: Fixed regions start below the dock

Fixed regions and viewport-sized pages SHALL start clear of the dock rather than under it.

#### Scenario: A fixed region is placed on a page

- **GIVEN** a page places a fixed region
- **WHEN** the page is shown
- **THEN** the region sits clear of the dock on every breakpoint

### Requirement: The messages area never shows a page of its own

The messages area SHALL open the reader's last room, or the friends page when the reader has no room, so its room list is always the left drawer.

#### Scenario: A reader opens the messages area with a last room

- **GIVEN** the reader has a last room
- **WHEN** the reader opens the messages area
- **THEN** the last room opens with the room list as its left drawer

#### Scenario: A reader opens the messages area with no room

- **GIVEN** the reader has no room
- **WHEN** the reader opens the messages area
- **THEN** the friends page opens
