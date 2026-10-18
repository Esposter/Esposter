## Purpose

An Add a todo field above the rows adds a todo on Enter and stays focused for the next one, so the edit dialog is for detail rather than for every new todo.

## Requirements

### Requirement: An Add a todo field leads the Items view

The Items view SHALL show an Add a todo field above the rows, in place of an add button.

#### Scenario: Owner opens the Items view

- **GIVEN** a TodoList
- **WHEN** the owner opens its Items view
- **THEN** an Add a todo field is shown above the rows

### Requirement: Enter adds a todo at the foot and keeps focus

Pressing Enter in the Add a todo field SHALL add a todo at the foot of the open todos, empty the field and keep focus in it.

#### Scenario: Owner adds a todo

- **GIVEN** the Add a todo field holds a name
- **WHEN** the owner presses Enter
- **THEN** a todo with that name is added at the foot of the open todos
- **AND** the field is empty and focused

### Requirement: A blank name adds nothing

A name made only of whitespace SHALL NOT add a todo.

#### Scenario: Only spaces typed

- **GIVEN** the field holds only spaces
- **WHEN** the owner presses Enter
- **THEN** no todo is added

### Requirement: A name past the length limit is refused

A name longer than the todo name limit SHALL be refused with an error and SHALL NOT be cut short.

#### Scenario: Name too long

- **GIVEN** a name longer than the limit
- **WHEN** the owner presses Enter
- **THEN** the field shows an error
- **AND** no todo is added and the name is not shortened

### Requirement: Escape empties the field

Pressing Escape in the Add a todo field SHALL empty it.

#### Scenario: Escape pressed

- **GIVEN** the field holds text
- **WHEN** the owner presses Escape
- **THEN** the field is empty

### Requirement: A refused add returns the name to the field

A refused save of a todo added from the field SHALL remove it from the list and return the typed name to the field, unless another name has already been typed there.

#### Scenario: Save refused

- **GIVEN** a todo added from the field
- **WHEN** its save is refused
- **THEN** the todo is removed from the list
- **AND** the typed name is back in the field

#### Scenario: Field already holds a new name

- **GIVEN** a refused add and a new name already typed in the field
- **WHEN** the refusal arrives
- **THEN** the new name is kept and the refused name is not put back

### Requirement: Quick add sets no date

Adding a todo from the field SHALL NOT set a due date or read a date from its name.

#### Scenario: Name contains a date

- **GIVEN** the owner types a name that contains a date
- **WHEN** the owner presses Enter
- **THEN** the todo has no due date

### Requirement: Search folds into a button beside the field

Search SHALL be a button beside the Add a todo field that opens a focused search field, and the search field SHALL fold away again once focus leaves it empty.

#### Scenario: Owner opens search

- **GIVEN** the Items view
- **WHEN** the owner chooses the search button
- **THEN** a focused search field opens

#### Scenario: Empty search left

- **GIVEN** an open search field with no query
- **WHEN** focus leaves it
- **THEN** the search folds back into its button

#### Scenario: Search in progress

- **GIVEN** a search field holding a query
- **WHEN** focus leaves it
- **THEN** the search field stays open

### Requirement: Double-clicking a Calendar day opens the dialog

Double-clicking a day in the Calendar SHALL open the todo dialog rather than adding a todo through the field.

#### Scenario: Calendar double-click

- **GIVEN** the Calendar is shown
- **WHEN** the owner double-clicks a day
- **THEN** the todo dialog opens
