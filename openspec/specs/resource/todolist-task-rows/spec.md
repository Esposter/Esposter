## Purpose

The Items blade lists todos as task rows — the title, one metadata line holding only what is set, and the notes clamped to a few lines — opening the detail dialog, in place of a data table.

## Requirements

### Requirement: The Items view lists todos as task rows

The Items view SHALL list todos as rows showing the title, a metadata line holding only what is set, and the notes, in place of a table.

#### Scenario: Todo with a due date and notes

- **GIVEN** a todo with a due date and notes
- **WHEN** the owner opens the Items view
- **THEN** its row shows the title, the due date and the notes

#### Scenario: Todo with nothing else set

- **GIVEN** a todo with no due date and no completion
- **WHEN** the owner opens the Items view
- **THEN** its row shows the title with no metadata line

### Requirement: A row opens its detail dialog

Pressing a row SHALL open that todo's detail dialog.

#### Scenario: Owner selects a row

- **GIVEN** a todo row
- **WHEN** the owner presses the row
- **THEN** the todo's detail dialog opens

### Requirement: An overdue due date is marked

A todo whose due date has passed and that is not completed SHALL have its due date marked as overdue.

#### Scenario: Overdue todo

- **GIVEN** an open todo whose due date has passed
- **WHEN** the list is shown
- **THEN** its due date is marked as overdue

### Requirement: Notes are clamped to six lines

The notes under a row SHALL show the first six rendered lines and end in an ellipsis when they run longer.

#### Scenario: Long notes

- **GIVEN** a todo whose notes run past six lines
- **WHEN** the list is shown
- **THEN** the notes show six lines and end in an ellipsis

#### Scenario: Link in the notes

- **GIVEN** a todo whose notes contain a link
- **WHEN** the owner clicks the link on the row
- **THEN** the todo's dialog opens instead of the link

### Requirement: Search matches the text of titles and notes

Search SHALL match todos whose title or notes text contains the query, reading the notes as text rather than as markup.

#### Scenario: Searching for a letter in notes markup

- **GIVEN** a todo whose notes hold a paragraph and whose title has no letter p
- **WHEN** the owner searches for p
- **THEN** that todo is not listed

### Requirement: Saved lists with the retired item type still load

Content saved with the retired item type SHALL still load, with that key dropped.

#### Scenario: Old item type in saved content

- **GIVEN** a todo list saved with a type on each item
- **WHEN** the owner opens the list
- **THEN** the list loads normally

### Requirement: Rows follow the list's own order

The rows SHALL be shown in the order the list holds.

#### Scenario: Default view

- **GIVEN** a list whose items are in a set order
- **WHEN** the owner opens the Items view
- **THEN** the rows follow that order
