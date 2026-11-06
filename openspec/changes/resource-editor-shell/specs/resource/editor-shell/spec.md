## ADDED Requirements

### Requirement: A region is drawn as its layout presents it

The shell SHALL draw each resolved region docked beside the canvas, floating over the canvas edge or as a sheet, as the layout presents it for the window's size class.

#### Scenario: A region is drawn as the layout presents it

- **GIVEN** a properties region docked on an expanded window and a sheet on a compact one
- **WHEN** the shell is drawn at each size
- **THEN** the region is a docked column on the expanded window
- **AND** it is a closed sheet on the compact one

### Requirement: A handle resizes regions from the pointer and the keyboard

A handle between docked regions SHALL resize them by the pointer and by the arrow keys, with Home and End moving to the limits, and SHALL report its value to assistive technology.

#### Scenario: A handle resizes from the keyboard

- **GIVEN** a focused handle beside a region
- **WHEN** the arrow key that widens the region is pressed
- **THEN** the region is wider by one step

#### Scenario: A resize past a limit stops at the limit

- **GIVEN** a region at its maximum size
- **WHEN** the arrow key that widens it is pressed
- **THEN** the region keeps its maximum size

### Requirement: A stored size is restored

The shell SHALL restore a region's size the reader set, the next time the same editor type opens.

#### Scenario: A stored size is restored on the next open

- **GIVEN** a reader who widened the properties region
- **WHEN** the editor is opened again
- **THEN** the region has the widened size

### Requirement: A group of tools is one tab stop

A group of tools the reader chooses between SHALL be one tab stop, with the arrow keys moving the choice along it.

#### Scenario: A group of tools is one tab stop

- **GIVEN** a group of four tools
- **WHEN** the reader presses Tab into it and then the right arrow
- **THEN** the second tool is chosen
- **AND** a further Tab leaves the group

### Requirement: Variants of a tool share one slot

A tool with variants SHALL occupy one slot showing the variant last used, with the other variants in a menu from the slot.

#### Scenario: Variants of a tool share one slot

- **GIVEN** a shape tool with three variants
- **WHEN** the reader chooses the second variant from the slot's menu
- **THEN** the slot shows the second variant
- **AND** the toolbar holds one button for the shape tool

### Requirement: A toolbar folds what does not fit into one menu

A toolbar that cannot fit all its items SHALL keep its pinned items and move the rest, in order, into one overflow menu.

#### Scenario: A toolbar folds what does not fit into one menu

- **GIVEN** a toolbar wider than its container with two pinned items
- **WHEN** it is drawn
- **THEN** the pinned items stay in the bar
- **AND** the items that do not fit are in one overflow menu

### Requirement: An unavailable tool says why

A toolbar item that cannot be used SHALL stay focusable and carry the reason it cannot be used as its description.

#### Scenario: An unavailable tool says why

- **GIVEN** an item disabled with a reason
- **WHEN** the item is focused
- **THEN** its description is the reason

### Requirement: A contextual panel shows content for the selection

A contextual panel SHALL show the content for the selection's kind, the document's own settings when nothing is selected in an editor that has them, and a field's value only when every selected element holds it, as Mixed otherwise.

#### Scenario: Nothing selected shows the document settings

- **GIVEN** an editor that has document settings, with nothing selected
- **WHEN** the contextual panel is drawn
- **THEN** it shows the document's settings

#### Scenario: Differing values show as mixed

- **GIVEN** two selected shapes with different fills
- **WHEN** the contextual panel is drawn
- **THEN** the fill field shows Mixed

### Requirement: A selection never moves the canvas

A contextual panel that opens for a selection SHALL open over the canvas and leave the canvas's size and position as they were.

#### Scenario: Selecting an element leaves the canvas where it was

- **GIVEN** an editor with nothing selected
- **WHEN** an element is selected
- **THEN** the canvas keeps its width

### Requirement: A compact window opens the panel from a button

On a compact window the contextual panel SHALL stay closed until the reader presses the button the shell shows while something is selected.

#### Scenario: A compact window opens the panel from a button

- **GIVEN** a compact window with an element selected
- **WHEN** the editor is drawn
- **THEN** the panel is closed
- **AND** a button that opens it is shown

### Requirement: A sheet or a floating panel closes on Escape

A sheet or a floating panel SHALL close on Escape and return focus to the control that opened it.

#### Scenario: Escape closes a sheet and returns focus

- **GIVEN** an open sheet opened from a button
- **WHEN** the reader presses Escape
- **THEN** the sheet is closed
- **AND** the button has focus

### Requirement: Every editor's layout passes the layout check

Each editor's layout and registry SHALL pass the layout check, so no selection kind meets a blank panel.

#### Scenario: Every editor's layout passes the layout check

- **GIVEN** each editor's layout and registry
- **WHEN** the layout check runs over them
- **THEN** it reports no finding

#### Scenario: A selection kind with no registered content fails the check

- **GIVEN** an editor whose registry lacks the content for one selection kind
- **WHEN** the layout check runs
- **THEN** it reports that selection kind
