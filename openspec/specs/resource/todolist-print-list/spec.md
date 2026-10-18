## Purpose

The TodoList is Portable with one export-only format, Print — Microsoft To Do's Print list, with toggles for the steps and notes — so a todo list has a way out besides the screen, and a PDF through the browser's print dialog.

## Requirements

### Requirement: Print is the list's one export format

The TodoList SHALL offer Print as its one export format in the resource's Export menu.

#### Scenario: Owner opens the Export menu

- **GIVEN** a TodoList
- **WHEN** the owner opens the Export menu
- **THEN** Print is offered

### Requirement: The print dialog holds two toggles

Choosing Print SHALL open a dialog with a Print steps toggle, on by default, and a Print notes toggle, off by default.

#### Scenario: Dialog opens with its defaults

- **GIVEN** a TodoList
- **WHEN** the owner chooses Print
- **THEN** Print steps is on
- **AND** Print notes is off

### Requirement: The print toggles carry to the next print

The print toggles SHALL be remembered for the next print the owner makes.

#### Scenario: Toggle changed for one print

- **GIVEN** the owner turned Print notes on
- **WHEN** the owner prints the list again
- **THEN** Print notes is still on

### Requirement: The printed list follows the list as shown

The printed list SHALL show the list's name, then its open todos in the owner's current sort, each with an empty circle to tick, then the completed todos under a Completed heading.

#### Scenario: Printing a list with completed todos

- **GIVEN** a list sorted by Due date with open and completed todos
- **WHEN** the owner prints it
- **THEN** the open todos are printed in Due date order, each with an empty circle
- **AND** the completed todos follow under a Completed heading, struck through

### Requirement: Steps and notes print when their toggles are on

The printed list SHALL include each todo's steps when Print steps is on, and its notes when Print notes is on.

#### Scenario: Steps and notes on

- **GIVEN** a todo with steps and notes
- **WHEN** the owner prints with both toggles on
- **THEN** the todo's steps and notes are printed under it

#### Scenario: Steps off

- **GIVEN** a todo with steps
- **WHEN** the owner prints with Print steps off
- **THEN** no steps are printed

### Requirement: Printing shows only the list, in the light scheme

While the list prints, the printed list SHALL be the only content printed, and it SHALL use the light colour scheme whatever the page's theme.

#### Scenario: Printing from a dark page

- **GIVEN** the owner is viewing the list in dark mode
- **WHEN** the owner prints the list
- **THEN** the printed list uses the light scheme
- **AND** no other part of the app is printed

### Requirement: The printed list is removed when printing ends

The printed list SHALL be removed from the page once printing ends.

#### Scenario: Printing ends

- **GIVEN** the browser's print has finished
- **WHEN** the print dialog closes
- **THEN** the printed list is removed from the page

### Requirement: The list offers no other export formats

The TodoList SHALL NOT offer CSV or Markdown export.

#### Scenario: Export menu lists the formats

- **GIVEN** a TodoList
- **WHEN** the owner opens the Export menu
- **THEN** only Print is offered
