## Purpose

useDragReorder, the pointer half of every reorderable list, table and sidebar, written on Pointer Events in place of vue-draggable-plus and SortableJS, with the upstream audit of both.

## Requirements

### Requirement: Pointer drag moves a row to a new place

A reorderable list SHALL let a user move a row to a new place by pressing it and dragging it with a pointer, handing the list its new order when the drop lands.

#### Scenario: Dragging a row past its neighbour

- **GIVEN** a list of three rows in a fixed order
- **WHEN** the user presses the first row, drags it past the second row and releases the pointer
- **THEN** the list receives the order with the dragged row in the second place
- **AND** the rows settle into their new places without a jump

#### Scenario: Releasing a row where it started

- **GIVEN** a list of three rows in a fixed order
- **WHEN** the user drags a row and releases it in its original place
- **THEN** the list receives no new order

### Requirement: A drag starts only on deliberate movement

A press SHALL start a drag only after the pointer has moved far enough, or after a touch has rested long enough, so that a plain click or a scroll is left to the page.

#### Scenario: A short press is a click

- **GIVEN** a row in a reorderable list
- **WHEN** the user presses the row and releases it without moving the pointer far
- **THEN** the row receives its click
- **AND** no reorder starts

#### Scenario: A touch swipe scrolls the page

- **GIVEN** a row in a reorderable list on a touch screen
- **WHEN** a finger moves across the row before the touch delay has passed
- **THEN** the page scrolls
- **AND** no reorder starts

#### Scenario: A press with a secondary button

- **GIVEN** a row in a reorderable list
- **WHEN** the user drags the row with a secondary mouse button
- **THEN** no reorder starts

#### Scenario: A press inside a text field

- **GIVEN** a text field inside a row
- **WHEN** the user presses the field and drags across it
- **THEN** the field keeps its own caret and selection
- **AND** no reorder starts

### Requirement: A drag handle limits where a drag starts

Where a list names a drag handle, a press SHALL start a drag only when it lands inside that handle.

#### Scenario: A press on the row body outside the handle

- **GIVEN** a table whose rows are dragged by a handle column
- **WHEN** the user presses the row outside the handle and drags it
- **THEN** the row does not move
- **AND** the press keeps its normal meaning

### Requirement: The held row follows the pointer and the others make room

While a drag is held, the held row SHALL follow the pointer and the rows it passes SHALL move aside to show where it will land.

#### Scenario: Rows make room for the held row

- **GIVEN** a list of rows of equal height
- **WHEN** the user holds a row and drags it up past two rows
- **THEN** the two rows move down by the height of the held row
- **AND** the held row stays under the pointer

#### Scenario: A zoomed list keeps the held row under the pointer

- **GIVEN** a list inside a scaled container
- **WHEN** the user drags a row
- **THEN** the held row stays under the pointer

### Requirement: A drag scrolls the area toward the pointer

While a drag is held near the edge of a scrolling area, the area SHALL scroll toward the pointer so that rows out of view can receive the drop.

#### Scenario: The pointer rests at the bottom edge

- **GIVEN** a scrolling list taller than its view
- **WHEN** the user holds a row with the pointer at the bottom edge of the list
- **THEN** the list scrolls down
- **AND** the row's place updates as the list moves

### Requirement: A drag ends without reordering when cancelled

A drag SHALL end with the old order kept when the user presses Escape, when the pointer is cancelled, or when a row is added or removed during the drag.

#### Scenario: Escape during a drag

- **GIVEN** a reorderable list inside a dialog
- **WHEN** the user presses Escape while dragging a row
- **THEN** the old order is kept
- **AND** the dialog stays open

#### Scenario: A row added during a drag

- **GIVEN** a reorderable list being dragged
- **WHEN** a new row appears in the list before the drop
- **THEN** the drag ends and the old order is kept

### Requirement: A touch drag holds the page still

Once a touch drag has begun, the page SHALL NOT scroll under the finger.

#### Scenario: Dragging a row by touch

- **GIVEN** a row in a reorderable list on a touch screen
- **WHEN** the user holds a row with a finger past the touch delay and moves it
- **THEN** the page stays still under the finger

### Requirement: Keyboard reordering stays available

A row SHALL be movable from the keyboard by holding Alt and pressing an arrow key, with the move read out to assistive technology.

#### Scenario: Moving a row with the keyboard

- **GIVEN** a focused row in a reorderable list
- **WHEN** the user holds Alt and presses the down arrow
- **THEN** the row moves one place down
- **AND** the new position is announced

### Requirement: Pointer reordering stays within one list

A pointer drag SHALL move a row only within its own list, group or table, and SHALL NOT move it to another list or copy it.

#### Scenario: Dragging a row toward another list

- **GIVEN** two reorderable lists on the screen
- **WHEN** the user drags a row from the first list over the second
- **THEN** the row stays in the first list

### Requirement: Each in-scope upstream defect has a regression test

Every upstream defect classed as in scope SHALL be covered by a regression test that fails against the previous implementation.

#### Scenario: An in-scope upstream issue is recorded

- **GIVEN** an upstream issue judged in scope for the reorder behaviour
- **WHEN** the reorder test suite is run
- **THEN** a test titled with that issue fails against the previous implementation
- **AND** the upstream issue cites that test as its proof
