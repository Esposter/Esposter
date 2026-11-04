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

#### Scenario: An overlap left under no compaction moves down until it clears

- **GIVEN** an item left overlapping another in a grid with no compaction
- **WHEN** the layout is placed
- **THEN** the overlapping item moves down until it clears the other

#### Scenario: A horizontal push past the last column moves the item down a row

- **GIVEN** two items in one row that a sideways compaction pushes past the last column
- **WHEN** the layout is placed
- **THEN** the pushed item moves down a row and then as far left as the row allows

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

#### Scenario: A swap that would leave either item past the last column

- **GIVEN** the swap mode
- **WHEN** an item is dropped onto one other, and trading places would run either item past the last column
- **THEN** the other item is pushed aside as in the push mode, so no item ends outside the columns

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

#### Scenario: A press whose pointer was released outside the grid starts no drag

- **GIVEN** a press on an item
- **WHEN** the pointer moves past the start distance with no button held
- **THEN** no drag starts
- **AND** nothing is written

### Requirement: An item resizes from any edge within the grid

The package SHALL resize an item from any of its four edges or four corners, keeping the opposite edge in place and the item within the grid.

#### Scenario: Resizing from the left edge

- **GIVEN** an item two columns from the grid's left edge
- **WHEN** its left edge is pulled one column left
- **THEN** the item starts one column further left and spans one column more
- **AND** its right edge stays where it was

#### Scenario: A touch press on a handle moves the item

- **GIVEN** an item in the grid
- **WHEN** a touch presses its handle and drags it
- **THEN** the item moves and keeps its size

#### Scenario: A sized-to-content item resizes its width only

- **GIVEN** an item sized to its content
- **WHEN** its right edge is pulled one column right
- **THEN** the item spans one column more and its height does not change

#### Scenario: A sized-to-content item's south edge changes nothing

- **GIVEN** an item sized to its content
- **WHEN** its bottom edge is pulled one row down
- **THEN** the grid commits nothing

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

#### Scenario: The grid's height is its last row's bottom plus the padding on both sides

- **GIVEN** a gap of 10, a padding of 20, rows 40 tall, and one item one row tall at the top
- **WHEN** the grid's height is read
- **THEN** it is 80

### Requirement: An item can take its height from its content

The package SHALL size an item marked as sized to its content to the whole rows that hold the content's height.

#### Scenario: A grid that is not editable reports no height change

- **GIVEN** a grid that is not editable, with an item sized to its content
- **WHEN** the content reports a new height
- **THEN** the grid commits nothing

#### Scenario: An item grows to hold its content

- **GIVEN** an item sized to its content, one row tall
- **WHEN** its content grows to just over two rows
- **THEN** the item spans three rows
- **AND** the change is written as a gesture's would be

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

### Requirement: An item steps by whole cells from the keyboard

The package SHALL step an item by whole cells, placed as a gesture is placed, and SHALL commit the step once when it lands.

#### Scenario: A step onto a free cell is committed

- **GIVEN** an item with free cells to its right
- **WHEN** the consumer steps it one column right
- **THEN** the grid commits the item at the new cell once

#### Scenario: A step past the last column changes nothing

- **GIVEN** an item at the last column
- **WHEN** the consumer steps it right
- **THEN** the item keeps its cell and the grid commits nothing

#### Scenario: A step above the top row changes nothing

- **GIVEN** an item in the top row
- **WHEN** the consumer steps it up
- **THEN** the item keeps its cell and the grid commits nothing

#### Scenario: A step that grows an item past the last column changes nothing

- **GIVEN** an item that ends at the last column
- **WHEN** the consumer grows it one column wider
- **THEN** the item keeps its span and the grid commits nothing

#### Scenario: A step that changes a sized-to-content item's height changes nothing

- **GIVEN** an item sized to its content
- **WHEN** the consumer steps it one row taller
- **THEN** the grid commits nothing

#### Scenario: A resize step never shrinks an item below one cell

- **GIVEN** an item one cell wide
- **WHEN** the consumer steps its width down
- **THEN** the item stays one cell wide and the grid commits nothing

#### Scenario: A step onto another item under prevent is refused

- **GIVEN** the prevent mode and an item beside the stepped one
- **WHEN** the consumer steps the item onto it
- **THEN** the grid commits nothing and the step reports that it was refused

### Requirement: A dragged-in item previews its landing cell

The package SHALL show an item dragged in from outside any grid where it would land on the grid under the pointer, and SHALL mark the preview refused when the grid would refuse the drop.

#### Scenario: Hovering the grid previews the landing cell

- **GIVEN** a palette entry dragged over an empty cell of the grid
- **WHEN** the pointer is over the grid
- **THEN** the placeholder is drawn at the cell it would land on
- **AND** it is not marked refused

#### Scenario: Hovering an item under prevent previews a refusal

- **GIVEN** the prevent mode and a palette entry dragged over an item of the grid
- **WHEN** the pointer is over the item
- **THEN** the placeholder is marked refused

#### Scenario: A layout replaced during a palette drag clears the preview

- **GIVEN** a palette entry previewed over the grid
- **WHEN** the grid's layout is replaced
- **THEN** no placeholder is drawn

#### Scenario: Leaving the grid clears the preview

- **GIVEN** a palette entry previewed over the grid
- **WHEN** the pointer leaves the grid
- **THEN** the placeholder is removed

#### Scenario: A layout replaced under a held palette preview is redrawn

- **GIVEN** a palette entry held over a cell of the grid
- **WHEN** the consumer replaces the items while the pointer stays in that cell
- **THEN** the held preview is dropped
- **AND** the next move previews the cell on the new layout

### Requirement: The package finds the first free cell for a new item

The package SHALL find the first cell a new item of a given span fits in, scanning rows from the top and columns from the left.

#### Scenario: A new item next to existing items

- **GIVEN** a grid whose first row holds two items, four columns wide
- **WHEN** a new item two columns wide is placed
- **THEN** it takes the first row's free cell right of them

### Requirement: Items drop in from outside the grid

The package SHALL take an item dragged in from outside every grid, return an item released over no grid to where it was, and pass over a grid the consumer refuses for the item.

#### Scenario: Dropping a palette entry into the grid

- **GIVEN** a palette entry dragged with the span it would take
- **WHEN** it is released over an empty cell of the grid
- **THEN** the entry is placed at that cell and the grid commits the items it pushes
- **AND** the drop hands the caller the cell and the grid's root element

#### Scenario: A drop outside every grid

- **GIVEN** a palette entry dragged over no grid
- **WHEN** it is released
- **THEN** nothing is committed

#### Scenario: A palette entry dropped onto an item under prevent is refused

- **GIVEN** the prevent mode and a palette entry dragged with the span it would take
- **WHEN** it is released over an item of the grid
- **THEN** the grid commits nothing

#### Scenario: a palette entry a grid refuses is neither previewed nor dropped

- **GIVEN** a palette entry the consumer refuses for the grid under the pointer, dragged over an item the grid would push aside
- **WHEN** the pointer is over the grid and the entry is released there
- **THEN** the grid draws no placeholder and commits nothing
- **AND** the drop hands the caller no cell

#### Scenario: A dropped item wider than the grid is narrowed to its columns

- **GIVEN** a palette entry wider than the grid's columns
- **WHEN** it is released over the grid's first column
- **THEN** the entry is placed at the first column, spanning every column

#### Scenario: A cancelled palette press accepts once on the next release

- **GIVEN** a palette press that the browser cancels
- **WHEN** the pointer is pressed and released again over the grid
- **THEN** the entry is placed once

### Requirement: An item dragged by its body moves to the grid it is released over

The package SHALL hand a body drag released over another grid to that grid when the consumer takes a transfer, and SHALL return the item to its cell when that grid refuses it, previewing nothing over a grid that refuses it before the release.

#### Scenario: Hovering another grid previews the landing cell there

- **GIVEN** a consumer that takes a transfer and an item dragged by its body
- **WHEN** the pointer is over another grid
- **THEN** that grid draws the placeholder at the cell under the pointer
- **AND** the item's own grid draws none

#### Scenario: Releasing over another grid hands the item to onTransfer and the source commits nothing

- **GIVEN** an item dragged by its body from a grid that takes a transfer, over another grid that holds an item where it would land
- **WHEN** the item is released over the other grid
- **THEN** the other grid commits the item it pushes aside
- **AND** the consumer receives the item and the cell it lands in, once
- **AND** the item's own grid writes nothing

#### Scenario: Releasing over its own grid commits

- **GIVEN** an item dragged by its body within a grid that takes a transfer
- **WHEN** the item is released over its own grid
- **THEN** the grid commits its changed cells
- **AND** no transfer is made

#### Scenario: A grid that refuses the item returns it

- **GIVEN** an item dragged by its body over a grid in the prevent mode that holds an item where it would land
- **WHEN** the item is released over that grid
- **THEN** nothing is written and the item returns to its cell

#### Scenario: #21 a grid that refuses the item previews nothing and commits no pushes

- **GIVEN** an item dragged by its body over a grid the consumer refuses for it, which holds an item where it would land
- **WHEN** the pointer is over that grid and the item is released there
- **THEN** that grid draws no placeholder and commits nothing
- **AND** no transfer is made and the item returns to its cell

#### Scenario: #21 unmounting the source grid mid-drag clears the placeholder it drew on another grid

- **GIVEN** an item dragged by its body over another grid, which draws its placeholder there
- **WHEN** the grid the item was dragged from unmounts
- **THEN** the other grid draws no placeholder

#### Scenario: #21 releasing over no grid commits in the item's own grid, with or without onTransfer

- **GIVEN** an item dragged by its body past the grid's edge, with or without a consumer that takes a transfer
- **WHEN** the item is released over no grid
- **THEN** the grid commits the cells its placeholder shows, clamped to the grid
- **AND** no transfer is made

#### Scenario: A resize never transfers

- **GIVEN** a resize handle pulled over another grid, in a grid that takes a transfer
- **WHEN** the handle is released
- **THEN** the grid commits its resized item
- **AND** no transfer is made

#### Scenario: Without onTransfer the item stays in its grid

- **GIVEN** a grid that takes no transfer and an item dragged by its body over another grid
- **WHEN** the item is released over that grid
- **THEN** the grid commits its changed cells
- **AND** the other grid writes nothing

### Requirement: A nested grid owns the presses on its items

The package SHALL give a press on an item of a nested grid to that grid, so the grid around it takes no gesture from it.

#### Scenario: A press on a nested grid's item is not the outer grid's

- **GIVEN** a grid inside an item of an outer grid
- **WHEN** an item of the inner grid is pressed and dragged
- **THEN** the outer grid commits nothing

#### Scenario: A nested item's gesture moves only the inner grid's item

- **GIVEN** a grid inside an item of an outer grid
- **WHEN** an item of the inner grid is pressed and dragged
- **THEN** the inner grid commits the item's new cell alone
