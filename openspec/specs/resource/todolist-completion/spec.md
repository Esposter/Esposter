## Purpose

A todo is completed by ticking the checkbox that leads its row; it holds its place struck through, then settles into a collapsible Completed section at the foot of the list, and a right-click deletes it.

## Requirements

### Requirement: Ticking the checkbox completes a todo and keeps it

Ticking the checkbox beside an open todo SHALL mark it completed with the time it was completed, keeping the todo rather than deleting it.

#### Scenario: Owner ticks an open todo

- **GIVEN** an open todo
- **WHEN** the owner ticks its checkbox
- **THEN** the todo is marked completed with the current time
- **AND** no confirmation is asked

### Requirement: Ticking a completed todo reopens it

Ticking the checkbox of a completed todo SHALL clear its completion and return it to open.

#### Scenario: Owner unticks a completed todo

- **GIVEN** a completed todo
- **WHEN** the owner ticks its checkbox again
- **THEN** the completion is cleared and the todo is open

### Requirement: A completed todo holds its place before it moves

A todo just completed SHALL stay in its place, struck through, for a short hold before it moves under Completed, and an untick during the hold SHALL cancel the move.

#### Scenario: Hold ends

- **GIVEN** an open todo the owner has just ticked
- **WHEN** the hold ends
- **THEN** the todo moves under the Completed section

#### Scenario: Untick during the hold

- **GIVEN** a todo just ticked and still held in its place
- **WHEN** the owner unticks it before the hold ends
- **THEN** the todo stays among the open todos

### Requirement: Completed todos gather in a Completed section

Completed todos SHALL be listed under a Completed section at the foot of the list, newest completion first, and the section SHALL be open by default.

#### Scenario: Completed section on first view

- **GIVEN** a list with completed and open todos
- **WHEN** the owner views the list
- **THEN** the completed todos appear under Completed at the foot, newest completion first
- **AND** the section is open

### Requirement: Collapsing the Completed section is remembered per viewer

Collapsing the Completed section SHALL be remembered on the viewer's device and SHALL NOT change the list's content.

#### Scenario: Owner collapses Completed

- **GIVEN** the Completed section is open
- **WHEN** the owner collapses it and returns to the list later on the same device
- **THEN** the section is still collapsed
- **AND** the list's content is unchanged

### Requirement: A completed todo is never shown overdue

A completed todo SHALL NOT be shown as overdue, even when its due date has passed.

#### Scenario: Completed todo past its due date

- **GIVEN** a completed todo whose due date has passed
- **WHEN** the list is shown
- **THEN** the todo is not marked overdue

### Requirement: Completing a todo plays a chime

Completing a todo SHALL play a short chime, unticking SHALL play none, and a browser that refuses audio SHALL still complete the todo silently.

#### Scenario: Owner completes a todo

- **GIVEN** an open todo
- **WHEN** the owner ticks it
- **THEN** a short chime plays

#### Scenario: Browser refuses audio

- **GIVEN** a browser that refuses to play audio
- **WHEN** the owner completes a todo
- **THEN** the todo is completed
- **AND** no error is shown to the owner

### Requirement: A refused save undoes the tick

A tick whose save is refused SHALL be undone and the todo shown as it was, unless a save from another device was adopted while the tick was in flight.

#### Scenario: Save refused

- **GIVEN** an open todo
- **WHEN** the owner ticks it and the save is refused
- **THEN** the todo is shown open again

#### Scenario: Another device saved in the meantime

- **GIVEN** a tick whose save is still in flight
- **WHEN** another device's save is adopted before this one settles
- **THEN** the other device's state stands

### Requirement: Every row offers completion and deletion in a menu

Every todo row SHALL offer a context menu holding Mark as completed or Mark as not completed, and Delete todo.

#### Scenario: Owner opens a row's menu

- **GIVEN** a todo row
- **WHEN** the owner opens its context menu
- **THEN** it offers Mark as completed or Mark as not completed, and Delete todo

### Requirement: Deleting asks for confirmation with the count

Deleting a todo or the completed todos SHALL first ask for confirmation, naming how many todos will be deleted.

#### Scenario: Owner deletes completed todos

- **GIVEN** a list with three completed todos shown
- **WHEN** the owner chooses Delete completed and confirms
- **THEN** the confirmation names three todos
- **AND** those three todos are deleted

#### Scenario: Refused delete restores the rows

- **GIVEN** a confirmed delete whose save is refused
- **WHEN** the save fails
- **THEN** each deleted todo is restored to its earlier place in the list

### Requirement: Delete completed removes only the todos the list shows

Delete completed SHALL delete only the completed todos its heading counts under the current search.

#### Scenario: Search narrows the completed todos

- **GIVEN** completed todos, some of which match the search
- **WHEN** the owner searches and chooses Delete completed
- **THEN** only the completed todos the search shows are deleted

### Requirement: The Calendar shows completed todos struck through

The Calendar SHALL show a completed todo on its due date, struck through.

#### Scenario: Completed todo on the calendar

- **GIVEN** a completed todo with a due date
- **WHEN** the owner views the Calendar
- **THEN** the todo appears on its due date struck through

### Requirement: Completed todos send no reminder

A completed todo SHALL send no due reminder, and reopening it SHALL schedule its due date again.

#### Scenario: Todo completed before its reminder fires

- **GIVEN** a reminder queued for a todo
- **WHEN** the todo is completed before the reminder fires
- **THEN** no reminder is sent

#### Scenario: Reopened todo reminds again

- **GIVEN** a completed todo with a future due date
- **WHEN** the owner reopens it
- **THEN** its due reminder is scheduled

### Requirement: Completed todos are kept until deleted

Completed todos SHALL be kept until the owner deletes them, with no automatic removal.

#### Scenario: Todo completed long ago

- **GIVEN** a todo completed long ago
- **WHEN** time passes
- **THEN** the todo is still listed under Completed
