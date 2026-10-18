# vue-grid-layout-headless/grid-layout Specification

## Purpose

The grid's placement of items on a grid of cells, and the pointer gestures that move, resize, drop and compact them, as the headless package `vue-grid-layout-headless` states them without styling.

## Requirements

### Requirement: Items stay within the columns and compact

The package SHALL keep every item within the grid's columns and compact the layout upward, sideways or not at all, as the consumer chooses.

#### Scenario: Compacting upward

- **GIVEN** an item with an empty row above it and vertical compaction
- **WHEN** the layout is placed
- **THEN** the item rises into the empty row

#### Scenario: Compacting sideways

- **GIVEN** an item with an empty column to its left and horizontal compaction
- **WHEN** the layout is placed
- **THEN** the item moves left into the empty column

#### Scenario: Leaving a dropped item where it lands

- **GIVEN** a grid with no compaction
- **WHEN** an item is dropped with empty rows above it
- **THEN** it stays where it was dropped

#### Scenario: An item wider than the grid

- **GIVEN** an item spanning more columns than the grid has
- **WHEN** the layout is placed
- **THEN** the item is narrowed to the grid's width

### Requirement: A collision pushes, swaps or refuses

The package SHALL resolve an item dropped onto others by pushing them aside, swapping with the one it lands on, or refusing the move, as the consumer chooses.

#### Scenario: Pushing items aside

- **GIVEN** the push mode
- **WHEN** an item is dropped onto another
- **THEN** the other item moves down out of its way

#### Scenario: Swapping two items on drop

- **GIVEN** the swap mode
- **WHEN** an item is dropped onto exactly one other
- **THEN** the two items trade places

#### Scenario: A swap that lands on several items

- **GIVEN** the swap mode
- **WHEN** an item is dropped across two others
- **THEN** the two are pushed aside as in the push mode

#### Scenario: A move refused under prevent

- **GIVEN** the prevent mode
- **WHEN** an item is dropped onto another
- **THEN** both items stay where they were

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

### Requirement: An item resizes from any edge within the grid

The package SHALL resize an item from any of its four edges or four corners, keeping the opposite edge in place and the item within the grid.

#### Scenario: Resizing from the left edge

- **GIVEN** an item two columns from the grid's left edge
- **WHEN** its left edge is pulled one column left
- **THEN** the item starts one column further left and spans one column more
- **AND** its right edge stays where it was

#### Scenario: A resize past the grid's edge

- **GIVEN** an item at the grid's left edge
- **WHEN** its left edge is pulled further left
- **THEN** the item stays at the grid's left edge

### Requirement: The grid's padding is apart from its gaps

The package SHALL place a padding around the grid that the consumer sets apart from the gap between items.

#### Scenario: Padding the grid apart from its gaps

- **GIVEN** a padding wider than the gap between items
- **WHEN** the layout is placed
- **THEN** the first item starts at the padding from the grid's edge
- **AND** neighbouring items stand the gap apart

### Requirement: An item can take its height from its content

The package SHALL size an item marked as sized to its content to the whole rows that hold the content's height.

#### Scenario: An item grows to hold its content

- **GIVEN** an item sized to its content, one row tall
- **WHEN** its content grows to just over two rows
- **THEN** the item spans three rows
- **AND** the change is written as a gesture's would be

### Requirement: Items drop in from outside and between grids

The package SHALL take an item dragged in from outside any grid or from another grid, and return an item dropped outside every grid to where it was.

#### Scenario: Dropping a palette entry into the grid

- **GIVEN** a palette entry dragged with the span it would take
- **WHEN** it is released over an empty cell of the grid
- **THEN** the grid writes a new item at that cell

#### Scenario: Moving an item into another grid

- **GIVEN** two grids on one page
- **WHEN** an item is dragged from the first and released over the second
- **THEN** the first grid writes its removal
- **AND** the second writes its addition at the cell under the pointer

#### Scenario: A drop outside every grid

- **GIVEN** an item dragged out of its grid
- **WHEN** it is released over no grid
- **THEN** nothing is written and the item returns to its cell

### Requirement: A nested grid owns its items' gestures

The package SHALL give a press to the grid nearest the pressed element, so a grid inside an item moves its own items without moving the item it sits in.

#### Scenario: Dragging inside a nested grid

- **GIVEN** a grid inside an item of an outer grid
- **WHEN** an item of the inner grid is dragged
- **THEN** the inner grid moves that item
- **AND** the outer grid's item stays where it was
