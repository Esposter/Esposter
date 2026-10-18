## Purpose

Open todos are put in the reader's own order by dragging a row or by Alt+Up and Alt+Down, through the UI library's reorderable list, and the order is the items array the content already stores.

## Requirements

### Requirement: Dragging reorders open todos in My order

Open todos SHALL be reordered by dragging a row, and only while the sort is My order.

#### Scenario: Drag in My order

- **GIVEN** a list in My order with several open todos
- **WHEN** the owner drags a row to a new place
- **THEN** the todo takes that place in the list

#### Scenario: Drag under another sort

- **GIVEN** a list sorted by Due date
- **WHEN** the owner tries to drag a row
- **THEN** the row does not move

### Requirement: Alt+Up and Alt+Down move a focused row

With a row focused, Alt+Up and Alt+Down SHALL move it one place, keeping focus on the row.

#### Scenario: Move with the keyboard

- **GIVEN** a focused open todo in My order
- **WHEN** the owner presses Alt+Down
- **THEN** the todo moves one place down
- **AND** focus stays on the todo

### Requirement: Completed todos do not drag

Completed todos SHALL NOT be reordered, since their order is the order they were completed in.

#### Scenario: Drag a completed todo

- **GIVEN** a completed todo under Completed
- **WHEN** the owner tries to drag it
- **THEN** it does not move

### Requirement: A refused reorder restores the earlier order

A refused reorder SHALL restore the order the todos had, unless a save from another device was adopted before it settled.

#### Scenario: Reorder refused

- **GIVEN** a reorder whose save is refused
- **WHEN** the save fails
- **THEN** the todos return to the order they had

### Requirement: Reordering keeps the places of hidden todos

Reordering SHALL keep the places of todos a search hides and of completed todos.

#### Scenario: Reordering under a search

- **GIVEN** a search that hides some todos
- **WHEN** the owner moves a visible todo
- **THEN** the hidden todos keep their places in the list

### Requirement: A touch swipe scrolls rather than drags

On touch, a row SHALL start dragging only after a short wait, so a swipe scrolls the list and a longer press opens the row's menu.

#### Scenario: Swipe across rows

- **GIVEN** a touch screen showing a list
- **WHEN** the owner swipes across the rows
- **THEN** the list scrolls and no row moves

#### Scenario: Long press on a row

- **GIVEN** a touch screen showing a list
- **WHEN** the owner presses a row for longer
- **THEN** the row's context menu opens
