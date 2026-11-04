# resource/dashboard-grid Specification

## Purpose

A dashboard's visuals sit on a grid the app draws itself: each is placed at its saved column and size, dragged and resized in the editor, and reflowed by width on a published dashboard.

## Requirements

### Requirement: A dashboard places each visual at its saved column and size

A dashboard SHALL draw each visual at the column, width and height it was saved with, at its saved row or the highest row above it that it can rise to without overlapping another visual.

#### Scenario: Opening a dashboard

- **GIVEN** a dashboard whose visuals were saved at their cells
- **WHEN** the dashboard is opened
- **THEN** each visual is drawn at its own column and size
- **AND** a visual with empty rows above it is drawn risen through them

### Requirement: A narrower screen reflows a dashboard without overlap

A published dashboard SHALL reflow to fewer columns on a narrower screen, and SHALL NOT overlap two visuals or place one outside the grid.

#### Scenario: Opening a dashboard on a phone

- **GIVEN** a dashboard laid out over twelve columns
- **WHEN** it is opened on a screen too narrow for twelve
- **THEN** its visuals fill the fewer columns that screen takes
- **AND** no two visuals overlap
- **AND** none extends past the grid's last column

### Requirement: Moving a visual pushes the visuals it lands on

Moving a visual in the editor SHALL push every visual it lands on below it and close the gaps the move leaves, unless the owner chose another collision setting in the Layout control.

#### Scenario: Dropping a visual onto another

- **GIVEN** two visuals in the editor
- **WHEN** the owner drags one onto the other's cell
- **THEN** the dragged visual takes that cell
- **AND** the other is pushed below it

#### Scenario: A short drag is a click

- **GIVEN** a visual in the editor
- **WHEN** the owner presses it and releases it without moving
- **THEN** the visual opens as a click opens it
- **AND** nothing moves

#### Scenario: Swapping places with the visual dropped on

- **GIVEN** the collision setting is Swap places and two visuals of the same size
- **WHEN** the owner drags one onto the other
- **THEN** the two visuals trade their cells

### Requirement: A resized visual stays within its bounds

Resizing a visual SHALL keep it at least one cell wide and tall and within the grid's columns.

#### Scenario: Shrinking a visual to nothing

- **GIVEN** a visual in the editor
- **WHEN** the owner drags its resize handle past its top-left corner
- **THEN** the visual is one cell wide and one cell tall

### Requirement: A move is saved once, when it ends

A move or a resize SHALL change the saved dashboard once, when the owner releases the visual, and SHALL show where the visual will land while it is held.

#### Scenario: Dragging across several cells

- **GIVEN** a visual in the editor
- **WHEN** the owner drags it across several cells and releases it
- **THEN** a placeholder shows its landing cell while it is held
- **AND** the dashboard changes once, after the release

### Requirement: A published dashboard never holds the page's scroll

A dashboard that cannot be edited SHALL let the reader scroll the page with a touch over any visual.

#### Scenario: Scrolling a published dashboard on a phone

- **GIVEN** a published dashboard on a touch screen
- **WHEN** the reader swipes over a visual
- **THEN** the page scrolls

### Requirement: A visual resizes from any edge or corner

The editor SHALL let the owner resize a visual from any of its eight edges and corners, keeping it at least one cell wide and tall within the grid's columns. A visual sized to its content resizes from its left and right edges only, since its height is its content's.

#### Scenario: Resizing from a side

- **GIVEN** a visual in the editor
- **WHEN** the owner drags its left edge one cell to the left
- **THEN** the visual is one cell wider
- **AND** its right edge stays where it was

#### Scenario: Resizing from a corner

- **GIVEN** a visual in the editor
- **WHEN** the owner drags its top-right corner one cell up and one cell right
- **THEN** its top and right edges move
- **AND** its bottom and left edges stay where they were

#### Scenario: A touch press on a handle starts no resize

- **GIVEN** a visual in the editor
- **WHEN** the owner touches its handle and drags
- **THEN** the visual keeps its size and position

#### Scenario: A sized-to-content visual's bottom edge changes nothing

- **GIVEN** a visual sized to its content in the editor
- **WHEN** the owner drags its bottom edge down
- **THEN** the visual keeps its height and nothing is saved

#### Scenario: Handles are hidden while a visual is not pointed at or focused

- **GIVEN** a visual in the editor that the pointer is not over and that has no focus
- **WHEN** the owner looks at it
- **THEN** no resize handle is drawn

#### Scenario: A visual shows an outline when pointed at or focused

- **GIVEN** a visual in the editor
- **WHEN** the pointer moves over it or it takes focus
- **THEN** a thin outline shows that it can be resized

#### Scenario: A published visual shows no outline

- **GIVEN** a visual on the published page
- **WHEN** the pointer moves over it
- **THEN** no outline is drawn

### Requirement: A visual moves and resizes from the keyboard

The editor SHALL move a focused visual one cell per arrow key, and resize it one cell per Shift and arrow key from its bottom-right corner, saving each step.

#### Scenario: Moving with the arrow keys

- **GIVEN** a visual focused in the editor
- **WHEN** the owner presses the right arrow key
- **THEN** the visual moves one column right and the step is saved

#### Scenario: Resizing with Shift and an arrow key

- **GIVEN** a visual focused in the editor
- **WHEN** the owner presses Shift and the down arrow key
- **THEN** the visual is one row taller and the step is saved

#### Scenario: A step that changes a sized-to-content visual's height changes nothing

- **GIVEN** a visual sized to its content focused in the editor
- **WHEN** the owner presses Shift and the down arrow key
- **THEN** the visual does not change and nothing is saved

#### Scenario: A step past the grid's edge changes nothing

- **GIVEN** a visual in the last column of the grid
- **WHEN** the owner presses the right arrow key
- **THEN** the visual does not move and nothing is saved

#### Scenario: A step onto another visual under block overlap is refused

- **GIVEN** the collision setting is Block overlap and a visual beside the focused one
- **WHEN** the owner presses the arrow key that would move the focused visual onto it
- **THEN** the visual does not move and nothing is saved

### Requirement: A palette tile adds a visual of its type

The editor SHALL add a visual of a palette tile's type where the tile is dropped on the grid, and SHALL add it at the first free cell when the tile is pressed or activated from the keyboard.

#### Scenario: Dropping a tile onto the grid

- **GIVEN** an empty dashboard in the editor
- **WHEN** the owner drags the Bar tile from the palette and releases it over the third column of the first row
- **THEN** a Bar visual is saved at that cell

#### Scenario: Activating a tile

- **GIVEN** a dashboard with one visual in the first row
- **WHEN** the owner activates the Table tile from the keyboard
- **THEN** a Table visual is saved at the first free cell, which is beside the existing visual

#### Scenario: A tile released outside the grid adds nothing

- **GIVEN** the owner drags the Line tile from the palette
- **WHEN** the tile is released outside the grid
- **THEN** no visual is added

#### Scenario: A tile released on a visual under block overlap adds nothing

- **GIVEN** the collision setting is Block overlap
- **WHEN** the owner drags a palette tile and releases it over an existing visual
- **THEN** no visual is added

### Requirement: The Add visual action adds an area visual at the first free cell

The editor's Add visual button SHALL add an Area visual at the first free cell of the grid.

#### Scenario: Adding a visual to a dashboard with visuals

- **GIVEN** a dashboard with two visuals
- **WHEN** the owner presses Add visual
- **THEN** a new Area visual is saved at the first cell that fits it, and the existing visuals do not move

### Requirement: A table fits its height to its content

The editor SHALL offer Fit height to content only for a table visual, which then takes the rows its content needs and no more.

#### Scenario: Turning on fit height for a table

- **GIVEN** a table visual five rows tall whose content needs two
- **WHEN** the owner turns on Fit height to content from the visual's menu
- **THEN** the visual takes the two rows its content needs
- **AND** the setting is saved with the visual

#### Scenario: A chart has no fit height item

- **GIVEN** a bar chart visual in the editor
- **WHEN** the owner opens the visual's menu
- **THEN** the menu has no Fit height to content item

#### Scenario: Turning fit height off keeps the rows it last had

- **GIVEN** a table visual with fit height on
- **WHEN** the owner turns fit height off
- **THEN** the visual keeps the rows it had when it was turned off
- **AND** the setting is saved with the visual

### Requirement: The owner sets how visuals pack and collide

The editor SHALL offer a Layout control that sets how visuals pack, upward, sideways or free, and what a drop does on another visual, push, swap or block overlap, defaulting to pack upward and push, and SHALL save the choice with the dashboard.

#### Scenario: Choosing block overlap

- **GIVEN** a dashboard on the default settings
- **WHEN** the owner chooses Block overlap in the Layout control
- **THEN** a visual dropped onto another is refused
- **AND** the choice is saved

#### Scenario: Choosing free placement

- **GIVEN** a dashboard with a gap above one of its visuals
- **WHEN** the owner chooses Free placement in the Layout control
- **THEN** the visual keeps the gap above it
- **AND** the choice is saved

#### Scenario: A save the server refuses reverts the choice

- **GIVEN** the owner chose Swap places in the Layout control
- **WHEN** the save of the dashboard is refused
- **THEN** the control shows the previous choice again

#### Scenario: A dashboard saved before the settings reads with the defaults

- **GIVEN** a stored dashboard with no layout settings
- **WHEN** the owner opens it
- **THEN** visuals pack upward and a drop pushes the visuals it lands on

#### Scenario: The published dashboard packs by the saved choice

- **GIVEN** a dashboard saved to pack sideways
- **WHEN** a viewer opens its published page
- **THEN** its visuals pack sideways

### Requirement: A visual's occasional actions are one menu

The editor SHALL keep a visual's edit, duplicate, export, fit height and delete actions in one menu on the visual, and SHALL ask the owner to confirm before a visual is deleted.

#### Scenario: Opening a visual's menu

- **GIVEN** a bound table visual in the editor
- **WHEN** the owner opens its menu
- **THEN** the menu lists Edit visual, Duplicate visual, Export CSV, Fit height to content and Delete visual

#### Scenario: Deleting asks first

- **GIVEN** a visual in the editor
- **WHEN** the owner chooses Delete visual from its menu
- **THEN** a dialog asks the owner to confirm
- **AND** the visual is removed only once the owner confirms

### Requirement: A viewer sees the visuals and the export, and no editing control

A published dashboard SHALL show its visuals and its own export, and SHALL show no palette, layout control or visual menu.

#### Scenario: Viewing a published dashboard

- **GIVEN** a published dashboard
- **WHEN** a viewer opens it
- **THEN** the page shows its visuals and the Export PNG action
- **AND** it shows no palette, Layout control or visual menu
