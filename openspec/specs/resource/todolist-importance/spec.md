## Purpose

A star trails every todo row and marks it important, and a Sort menu — my order, importance, due date, alphabetically, creation date — orders the open todos without touching the list's own order.

## Requirements

### Requirement: A star marks a todo as important

A star on each todo SHALL mark it important or clear the mark, taking effect at once with no confirmation.

#### Scenario: Owner stars a todo

- **GIVEN** an unstarred todo
- **WHEN** the owner selects its star
- **THEN** the todo is marked important
- **AND** the star shows as filled

#### Scenario: Refused star save

- **GIVEN** an unstarred todo
- **WHEN** the owner stars it and the save is refused
- **THEN** the star returns to its earlier state

### Requirement: Importance can be set from the row menu and the dialog

Importance SHALL be settable from a todo's context menu and from its dialog as well as from its star.

#### Scenario: Row menu

- **GIVEN** a todo row
- **WHEN** the owner chooses Mark as important from its context menu
- **THEN** the todo is marked important

#### Scenario: Dialog

- **GIVEN** a todo's dialog is open
- **WHEN** the owner stars the todo and saves the dialog
- **THEN** the todo is important once saved

### Requirement: The Sort menu offers five orders

The Sort menu SHALL offer My order, Importance, Due date, Alphabetically and Creation date, and SHALL show the order in use when it opens.

#### Scenario: Owner opens the Sort menu

- **GIVEN** a list sorted by due date
- **WHEN** the owner opens the Sort menu
- **THEN** the five orders are offered
- **AND** Due date is shown as the one in use

### Requirement: Sorting changes only the view of the open todos

Sorting SHALL change only the order the open todos are shown in, and choosing My order SHALL restore the list's own order exactly.

#### Scenario: Sort by importance, then back to My order

- **GIVEN** a list in My order
- **WHEN** the owner sorts by Importance and then chooses My order
- **THEN** the todos are shown in the list's own order again

### Requirement: Each sort orders the open todos its own way

Importance SHALL list starred todos first, Due date SHALL list the soonest first with undated todos last, Alphabetically SHALL list by title in the reader's locale, and Creation date SHALL list the newest first.

#### Scenario: Due date sort with an undated todo

- **GIVEN** todos with due dates and one todo with no due date
- **WHEN** the owner sorts by Due date
- **THEN** the undated todo is listed last

#### Scenario: Alphabetical sort

- **GIVEN** todos with titles
- **WHEN** the owner sorts Alphabetically
- **THEN** they are listed by title in the reader's locale

### Requirement: Todos a sort ranks alike keep the list's order

Todos that a sort ranks equally SHALL keep the order they hold in the list.

#### Scenario: Unstarred todos under Importance

- **GIVEN** starred and unstarred todos in the list's order
- **WHEN** the owner sorts by Importance
- **THEN** the unstarred todos keep their order from the list

### Requirement: The Completed section ignores the sort

The Completed section SHALL list the newest completion first whatever the sort.

#### Scenario: Sort changed with completed todos

- **GIVEN** completed todos under Completed
- **WHEN** the owner sorts by Alphabetically
- **THEN** Completed still lists the newest completion first

### Requirement: The chosen sort is remembered per list on each device

The sort chosen for a list SHALL be remembered on the viewer's device and SHALL NOT change the list's content.

#### Scenario: Sort kept after reopening

- **GIVEN** the owner chose Importance on a list
- **WHEN** the owner reopens that list on the same device
- **THEN** Importance is still the sort in use
