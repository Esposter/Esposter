# vue-grid-layout-headless/grid-layout Specification

## Purpose

The grid's placement of items on a grid of cells, and the pointer gestures that move, resize and drop them, as the headless package `vue-grid-layout-headless` states them without styling.

## Requirements

### Requirement: Items stay within the columns and compact upward

The package SHALL keep every item within the grid's columns and compact the layout upward.

#### Scenario: Compacting upward

- **GIVEN** an item with an empty row above it
- **WHEN** the layout is placed
- **THEN** the item rises into the empty row

#### Scenario: An item wider than the grid

- **GIVEN** an item spanning more columns than the grid has
- **WHEN** the layout is placed
- **THEN** the item is narrowed to the grid's width

#### Scenario: An item that starts inside another moves down until it clears

- **GIVEN** an item left overlapping another
- **WHEN** the layout is placed
- **THEN** the overlapping item moves down until it clears the other

### Requirement: A dropped item pushes the items it lands on

The package SHALL resolve an item dropped onto others by pushing them down out of its way.

#### Scenario: Pushing items aside

- **GIVEN** an item dropped onto another
- **WHEN** the layout is placed
- **THEN** the other item moves down out of its way

### Requirement: A press becomes a drag and writes once

The package SHALL start a drag only once a press moves past the start distance, and write the cells a drag changed once, when its pointer is released.

#### Scenario: A press that barely moves stays a click

- **GIVEN** a press on an item
- **WHEN** the pointer is released before moving the start distance
- **THEN** nothing is written
- **AND** the item's click reaches its content

#### Scenario: A drag writes its changed cells once

- **GIVEN** a drag that moves an item and pushes another
- **WHEN** the pointer is released
- **THEN** one write holds both items' new cells

#### Scenario: A cancelled pointer writes nothing

- **GIVEN** a drag in progress
- **WHEN** the browser cancels its pointer
- **THEN** nothing is written
- **AND** every item returns to its cell

#### Scenario: A second pointer pressed during a drag

- **GIVEN** a drag held by one pointer
- **WHEN** a second pointer presses another item
- **THEN** the drag carries on with the first pointer
- **AND** the second press starts nothing

#### Scenario: A press whose pointer was released outside the grid starts no drag

- **GIVEN** a press on an item
- **WHEN** the pointer moves past the start distance with no button held
- **THEN** no drag starts
- **AND** nothing is written

### Requirement: An item resizes from its south-east corner within the grid

The package SHALL resize an item from its south-east corner, keeping its origin in place and the item within the grid.

#### Scenario: Resizing from the south-east corner

- **GIVEN** an item two columns from the grid's left edge
- **WHEN** its south-east corner is pulled one column right and one row down
- **THEN** the item spans one column and one row more
- **AND** its origin stays where it was

#### Scenario: A resize past the grid's right edge

- **GIVEN** an item that reaches the grid's right side
- **WHEN** its south-east corner is pulled further right
- **THEN** the item stays within the grid's columns

### Requirement: The grid's padding is apart from its gaps

The package SHALL place a padding around the grid that the consumer sets apart from the gap between items.

#### Scenario: Padding the grid apart from its gaps

- **GIVEN** a padding wider than the gap between items
- **WHEN** the layout is placed
- **THEN** the first item starts at the padding from the grid's edge
- **AND** neighbouring items stand the gap apart

#### Scenario: The grid's height is its last row's bottom plus the padding on both sides

- **GIVEN** a gap of 10, a padding of 20, rows 40 tall, and one item one row tall at the top
- **WHEN** the grid's height is read
- **THEN** it is 80

### Requirement: Items move between grids

The package SHALL take an item dragged from another grid and drop it onto the grid under the pointer, and return an item released over no grid to where it was.

#### Scenario: Moving an item into another grid

- **GIVEN** two grids on one page
- **WHEN** an item is dragged from the first and released over the second
- **THEN** the first grid writes its removal
- **AND** the second writes its addition at the cell under the pointer

#### Scenario: A drop outside every grid

- **GIVEN** an item dragged out of its grid
- **WHEN** it is released over no grid
- **THEN** nothing is written and the item returns to its cell

#### Scenario: A release over another grid routes past the dragged tile

- **GIVEN** the dragged item's own tile under the pointer, with another grid's tile beneath it
- **WHEN** the item is released
- **THEN** the release reaches the grid beneath the dragged tile

### Requirement: A nested grid owns its items' gestures

The package SHALL give a press to the grid nearest the pressed element, so a grid inside an item moves its own items without moving the item it sits in.

#### Scenario: Dragging inside a nested grid

- **GIVEN** a grid inside an item of an outer grid
- **WHEN** an item of the inner grid is dragged
- **THEN** the inner grid moves that item
- **AND** the outer grid's item stays where it was

### Requirement: A gesture ends when its layout is replaced

The package SHALL end a gesture when the layout it previews is replaced under it, so a release never writes cells the new layout does not have.

#### Scenario: A layout replaced during a gesture ends it

- **GIVEN** a drag in progress with its placeholder shown
- **WHEN** the consumer replaces the items
- **THEN** the placeholder is gone
- **AND** a release writes nothing

### Requirement: A grid draws no tiles before its width is known

The package SHALL return no tiles until its root reports a width, so a server render or a first frame draws no tile of no width.

#### Scenario: A grid draws no tiles before its width is known

- **GIVEN** a grid whose items are placed but whose width is not yet measured
- **WHEN** the grid is first rendered
- **THEN** it draws no tiles
- **AND** it draws them once the width is reported
