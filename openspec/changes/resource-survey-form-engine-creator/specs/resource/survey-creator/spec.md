## ADDED Requirements

### Requirement: The owner adds a question from the palette

Choosing a question kind in the palette SHALL insert a new question of that kind after the selected element, or at the end of the current page when nothing is selected, and SHALL select it.

#### Scenario: Owner adds a rating question

- **GIVEN** the owner is editing a survey whose first question is selected
- **WHEN** the owner chooses the rating kind in the palette
- **THEN** a rating question is inserted directly after the selected question
- **AND** the new question is selected

### Requirement: Every move the pointer can make has a keyboard command

The Creator SHALL offer moving an element up, down, into the previous element, out of its parent and to another place as keyboard commands, and each SHALL leave the document valid or be refused with the document unchanged.

#### Scenario: Owner moves a question up with the keyboard

- **GIVEN** a page with two questions and the second selected
- **WHEN** the owner presses the move-up shortcut
- **THEN** the second question precedes the first
- **AND** the document passes the survey check

#### Scenario: A question is moved into a place that refuses it

- **GIVEN** a dynamic panel and a question that is itself a dynamic panel
- **WHEN** the owner moves the second into the first's template
- **THEN** the move is refused
- **AND** the document is unchanged

### Requirement: An edit can be undone and redone

Each edit SHALL be undoable, and undoing then redoing SHALL restore the document each time.

#### Scenario: Undo after a move

- **GIVEN** the owner moved a question to another page
- **WHEN** the owner undoes
- **THEN** the question is back where it was

### Requirement: An imported document that fails the survey check is refused

Importing a file SHALL be refused when its content does not pass the survey check, SHALL leave the open survey unchanged, and SHALL name the path of the fault.

#### Scenario: Import with a duplicate name

- **GIVEN** a file holding a survey whose two questions share a name
- **WHEN** the owner imports it
- **THEN** the import is refused with the second question's path
- **AND** the open survey is unchanged
