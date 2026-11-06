# resource/editor-shell Specification

## Purpose

The editor shell draws an editor's regions from the layout the layout package resolved: each docked beside the canvas, floating over its edge or held as a sheet, with the resize handles, the toolbar and the contextual panel that fill them. It is what lets every editor reach its tools and panels the same way, from the keyboard and from a phone.

## Requirements

### Requirement: A region is drawn as its layout presents it

The shell SHALL draw each resolved region docked beside the canvas, floating over the canvas edge or as a sheet, as the layout presents it for the window's size class.

#### Scenario: A region is drawn as the layout presents it

- **GIVEN** a properties region docked on an expanded window and a sheet on a compact one
- **WHEN** the shell is drawn at each size
- **THEN** the region is a docked column on the expanded window
- **AND** it is a closed sheet on the compact one

### Requirement: A region's content stays inside its region

A docked or overlay region SHALL scroll content taller than itself inside the region, so its content never paints over the canvas or a region beside it.

#### Scenario: Content taller than its region scrolls inside it

- **GIVEN** a docked bar whose content is taller than the bar
- **WHEN** the shell is drawn
- **THEN** the content scrolls inside the bar
- **AND** the canvas below the bar is not covered

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

### Requirement: A region with equal limits has no handle

A docked region whose minimum size equals its maximum SHALL draw no handle, since no size of it can change.

#### Scenario: A region with equal limits draws no resize handle

- **GIVEN** a docked region whose minimum and maximum size are equal
- **WHEN** the shell is drawn
- **THEN** the region is drawn at that size with no handle

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

A contextual panel SHALL show a field's value only when every selected element holds it, and Mixed otherwise.

#### Scenario: Differing values show as mixed

- **GIVEN** two selected shapes with different fills
- **WHEN** the contextual panel is drawn
- **THEN** the fill field shows Mixed

### Requirement: A selection never moves what the canvas shows

A contextual panel that opens for a selection SHALL open over the canvas and leave the canvas's width and its top edge as they were. A compact window's sheet buttons sit in a strip below the canvas, which shortens it from below and moves nothing the reader selected.

#### Scenario: Selecting an element leaves the canvas where it was

- **GIVEN** an editor with nothing selected
- **WHEN** an element is selected
- **THEN** the canvas keeps its width

### Requirement: An overlay column sits clear of an overlay bar

An overlay column SHALL start below each open overlay bar at the top edge and end above each open overlay bar at the bottom edge, so a bar and a column never claim the same corner.

#### Scenario: An overlay column sits clear of an overlay bar

- **GIVEN** an open overlay bar at the top edge and an open overlay column at the end edge
- **WHEN** the shell is drawn
- **THEN** the column starts at the bar's bottom edge
- **AND** with the bar closed, the column starts at the top edge

### Requirement: A compact window opens the panel from a button

On a compact window the contextual panel SHALL stay closed until the reader presses the button the shell shows while something is selected.

#### Scenario: A compact window opens the panel from a button

- **GIVEN** a compact window with an element selected
- **WHEN** the editor is drawn
- **THEN** the panel is closed
- **AND** a button that opens it is shown

### Requirement: A compact window draws its sheet buttons below the canvas

On a compact window the shell SHALL draw each sheet's button in a strip below the canvas, so no button covers a control of the canvas and the canvas's top edge stays where it was.

#### Scenario: A compact window draws its sheet buttons below the canvas

- **GIVEN** a compact window with an element selected
- **WHEN** the editor is drawn
- **THEN** the button that opens the panel is drawn in a strip below the canvas
- **AND** the canvas holds no button

### Requirement: A compact window's sheet rises from the bottom

On a compact window the shell SHALL open each sheet up from the bottom edge, to most of the window's height and no further, so the canvas stays in view above it. On a wider window a sheet SHALL stand at its region's own edge.

#### Scenario: A compact window opens a sheet from the bottom

- **GIVEN** a compact window with a side region held as a sheet
- **WHEN** the sheet is drawn
- **THEN** it rises from the bottom edge

#### Scenario: A medium window opens a sheet from its own edge

- **GIVEN** a medium window with an end region held as a sheet
- **WHEN** the sheet is drawn
- **THEN** it opens from the end edge

### Requirement: A compact window places the tool region at the bottom

On a compact window the tool region SHALL sit at the bottom edge of the editor, not the top.

#### Scenario: A compact window places the tool region at the bottom

- **GIVEN** a freeform editor on a compact window
- **WHEN** the editor is drawn
- **THEN** the tool region is at the bottom edge

### Requirement: A sheet closes on Escape

A sheet SHALL close on Escape and return focus to the control that opened it. The shell draws no close for a floating panel yet, so a floating panel is not part of this requirement.

#### Scenario: Escape closes a sheet and returns focus

- **GIVEN** an open sheet opened from a button
- **WHEN** the reader presses Escape
- **THEN** the sheet is closed
- **AND** the button has focus

### Requirement: Every editor's layout passes the layout check

Each editor's layout and registry SHALL pass the layout check, so no selection kind meets a blank panel.

#### Scenario: An editor's layout passes the layout check

- **GIVEN** an editor's layout and registry
- **WHEN** the layout check runs over them
- **THEN** it reports no finding
