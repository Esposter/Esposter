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

#### Scenario: A touch press on a handle moves the visual

- **GIVEN** a visual in the editor
- **WHEN** the owner touches its handle and drags
- **THEN** the visual moves and keeps its size

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

#### Scenario: The published dashboard packs by the saved choice

- **GIVEN** a dashboard saved to pack sideways
- **WHEN** a viewer opens its published page
- **THEN** its visuals pack sideways

### Requirement: A visual's occasional actions are one menu

The editor SHALL keep a visual's edit, duplicate, export, fit height, move to and delete actions in one menu on the visual, with export only where the visual holds rows, and SHALL ask the owner to confirm before a visual is deleted.

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

### Requirement: A group holds visuals on a grid of its own

A group visual SHALL hold other visuals, each placed on the group's own grid, and the owner SHALL add, edit, move and place a visual inside a group as the dashboard's own visuals are added and placed.

#### Scenario: adds a visual into a group, leaving the dashboard's own list as it was

- **GIVEN** a dashboard holding one group visual
- **WHEN** the owner adds a bar visual to the group
- **THEN** the group holds the bar visual
- **AND** the dashboard's own visuals are unchanged

#### Scenario: updates a visual held by a group by its id alone

- **GIVEN** a visual held by a group
- **WHEN** the owner places it on another cell of the group's grid
- **THEN** the visual takes the new cell inside the group

#### Scenario: keeps the visuals a group holds when its edit is saved

- **GIVEN** the owner opened a group's edit form and then added a visual to the group
- **WHEN** the owner saves the edit
- **THEN** the group still holds the added visual

### Requirement: A group nests no deeper than the depth cap

A group SHALL NOT sit inside more groups than the depth cap allows. A dashboard holding such a group SHALL be refused, and an add or move that would make one SHALL be refused and change nothing.

#### Scenario: accepts a nested tree of groups up to the depth cap, with plain visuals in the deepest

- **GIVEN** a tree of groups nested to the depth cap, each holding the next
- **WHEN** the dashboard is saved
- **THEN** the save is accepted

#### Scenario: refuses a group nested past the depth cap

- **GIVEN** a tree of groups nested one level past the depth cap
- **WHEN** the dashboard is saved
- **THEN** the save is refused

#### Scenario: refuses adding a group inside a group at the depth cap

- **GIVEN** a group at the depth cap
- **WHEN** the owner adds a group inside it
- **THEN** no group is added

#### Scenario: refuses a move that nests a group past the depth cap

- **GIVEN** a group whose deepest group sits at the depth cap, and another group holding a group
- **WHEN** the owner moves the nested group into the group at the depth cap
- **THEN** the group stays where it was

### Requirement: A visual id is unique across every group

Every visual SHALL have an id that no other visual in the dashboard holds, however deep it sits, and a dashboard holding a repeated id SHALL be refused.

#### Scenario: refuses a visual id held twice, across levels of the tree

- **GIVEN** a group and a visual inside it sharing one id
- **WHEN** the dashboard is saved
- **THEN** the save is refused

### Requirement: Only a group holds visuals, and a group holds no dataset binding

A group SHALL hold visuals and no dataset binding, every other type SHALL hold no visuals, and a group's type SHALL NOT change in either direction.

#### Scenario: refuses a group with no visuals to hold

- **GIVEN** a group visual with no visuals field
- **WHEN** the dashboard is saved
- **THEN** the save is refused

#### Scenario: refuses a visual of another type that holds visuals

- **GIVEN** a bar visual holding visuals
- **WHEN** the dashboard is saved
- **THEN** the save is refused

#### Scenario: refuses a group with a dataset binding

- **GIVEN** a group visual with a dataset binding
- **WHEN** the dashboard is saved
- **THEN** the save is refused

#### Scenario: keeps a group's type and never makes a visual a group

- **GIVEN** a group and a bar visual
- **WHEN** the owner changes the group's type to bar and the bar visual's type to group
- **THEN** the group stays a group and the bar visual stays a bar visual

### Requirement: Deleting, duplicating and moving a group carry the visuals it holds

Deleting a group SHALL remove the visuals it holds. Duplicating a group SHALL copy them under new ids, and moving a visual SHALL move the visuals it holds with it, but a group SHALL NOT move into a group it holds.

#### Scenario: deleting a group removes the visuals it holds with it

- **GIVEN** a group holding a bar visual
- **WHEN** the owner deletes the group
- **THEN** no visual remains

#### Scenario: duplicates a group with fresh ids for every visual it holds

- **GIVEN** a group holding a bar visual
- **WHEN** the owner duplicates the group
- **THEN** the copy holds a bar visual under an id no other visual has

#### Scenario: moves a visual with its subtree into a group at the cell given

- **GIVEN** a group holding a bar visual, and an empty group beside it
- **WHEN** the owner moves the first group into the empty group at a cell
- **THEN** the empty group holds the first group at that cell
- **AND** the first group still holds the bar visual

#### Scenario: refuses to move a group into a group it holds

- **GIVEN** a group holding another group
- **WHEN** the owner moves the outer group into the inner one
- **THEN** the outer group stays where it was

### Requirement: Every reader of a dashboard reads the visuals a group holds

The published view, the snapshot summary, the resource links, the agent's schema and blueprint capture SHALL read a group's visuals as they read the dashboard's own.

#### Scenario: bakes a snapshot for a bound visual inside a group

- **GIVEN** a group holding a visual bound to a survey
- **WHEN** the dashboard is published
- **THEN** the published visual inside the group carries the snapshot of its binding

#### Scenario: dashboard: counts every visual in the tree, a group's included

- **GIVEN** a dashboard holding a group with two visuals and one visual outside it
- **WHEN** a snapshot of the dashboard is summarized
- **THEN** the summary counts every visual of the tree

#### Scenario: reads a dataset binding held by a visual inside a group

- **GIVEN** a group holding a visual bound to a sheet
- **WHEN** the resource links of the dashboard are read
- **THEN** the sheet is one of the links

#### Scenario: describes a group's visuals as the visual schema again, by reference

- **GIVEN** the dashboard's content schema
- **WHEN** an agent reads its JSON Schema
- **THEN** a group's visuals are described by reference to the visual definition

#### Scenario: reads the entry a group's bound visual names as a dependency of the dashboard

- **GIVEN** a blueprint entry for a dashboard whose group holds a visual bound to another entry
- **WHEN** the blueprint's entries are validated
- **THEN** the dashboard entry depends on the entry it is bound to

### Requirement: A group shows its title and a grid of its visuals in the editor

A group SHALL show its title in a header over a grid of the visuals it holds, each drawn as the dashboard draws them, and an empty group SHALL say how to fill it.

#### Scenario: heads an untitled group in the editor as Untitled group

- **GIVEN** a group with no title in the editor
- **WHEN** the owner views the dashboard
- **THEN** the group's header reads Untitled group

#### Scenario: tells the owner how to fill an empty group

- **GIVEN** an empty group in the editor
- **WHEN** the owner views the dashboard
- **THEN** the group says to drop a visual into it or to choose Move to in a visual's menu

#### Scenario: shows each visual a group holds on the group's own grid

- **GIVEN** a group holding a bar visual and a table visual
- **WHEN** the owner views the dashboard
- **THEN** the group's grid draws both visuals

### Requirement: A visual released over a group's grid joins that group

A palette tile or a visual released over a group's grid SHALL be placed inside that group, and a visual released over the dashboard's own grid SHALL leave the group it was in.

#### Scenario: a tile dropped on a group's grid adds a visual inside that group

- **GIVEN** an empty group in the editor
- **WHEN** the owner drags the Bar tile from the palette and releases it over the group's grid
- **THEN** the group holds a Bar visual

#### Scenario: a visual released over a group's grid moves into that group

- **GIVEN** a card visual on the dashboard and an empty group
- **WHEN** the owner drags the card and releases it over the group's grid
- **THEN** the group holds the card

#### Scenario: a visual released over the dashboard's own grid leaves its group

- **GIVEN** a group holding a card visual
- **WHEN** the owner drags the card and releases it over the dashboard's own grid
- **THEN** the card is on the dashboard and the group holds no visual

### Requirement: The owner moves a visual into a group from its menu

A visual's menu SHALL offer Move to where the visual has a group or the dashboard to go to, and the move SHALL place the visual at the first free cell of the group chosen. The menu SHALL NOT offer a group the move would nest past the depth cap.

#### Scenario: move to is offered only where the visual has somewhere else to go

- **GIVEN** a card visual and an empty group on the dashboard
- **WHEN** the owner opens the menus of the card and the group
- **THEN** the card's menu offers Move to
- **AND** the group's menu offers no Move to

#### Scenario: a group offers no group inside it and no group that would nest it past the cap

- **GIVEN** a group holding another group, and a chain of four groups on the dashboard
- **WHEN** the owner opens the outer group's Move to
- **THEN** the menu lists no group the outer group would take past the depth cap
- **AND** the menu lists no group the outer group holds

#### Scenario: a visual moved into a group takes the first free cell of that group

- **GIVEN** a group holding a card at its first cell, and a card outside the group
- **WHEN** the owner chooses the group in Move to
- **THEN** the moved card takes the first free cell after the group's card

### Requirement: A group's menu has no export, and its delete counts what it takes

A group's menu SHALL offer fit height and no export, and its delete confirm SHALL name the group and the number of visuals it takes with it.

#### Scenario: a group's menu offers its fit height and no export

- **GIVEN** an empty group in the editor
- **WHEN** the owner opens the group's menu
- **THEN** the menu lists Edit visual, Duplicate visual, Fit height to content and Delete visual, and no Export CSV

#### Scenario: a group's delete confirm says how many visuals it takes with it

- **GIVEN** a group holding two visuals
- **WHEN** the owner chooses Delete visual from the group's menu
- **THEN** the confirm names the group and says it takes two visuals with it

### Requirement: A published group is read-only, and its visuals keep their export

A published group SHALL draw its visuals with no editing control, and a bound visual inside it SHALL keep its export.

#### Scenario: a published group draws its bound child with the child's export

- **GIVEN** a group holding a card bound to a snapshot
- **WHEN** a viewer opens the published dashboard
- **THEN** the card offers Export CSV
- **AND** the group offers none

#### Scenario: a published group draws no header when it is untitled

- **GIVEN** an untitled group on a published dashboard
- **WHEN** a viewer opens it
- **THEN** the group draws no header
