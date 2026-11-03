## ADDED Requirements

### Requirement: The owner adds a question from the palette

The palette SHALL insert a chosen question kind after the selected element, or at the end of the first page when nothing is selected, and the inserted question is selected.

#### Scenario: Owner adds a rating question

- **GIVEN** the owner is editing a survey whose first question is selected
- **WHEN** the owner chooses the rating kind in the palette
- **THEN** a rating question is inserted directly after the selected question
- **AND** the new question is selected

### Requirement: Alt+arrow moves the selected element

The Creator SHALL move the selected element up, down, into the element before it or out of its parent when the owner presses the matching Alt+arrow shortcut. A move the document does not accept is refused, leaving the document unchanged.

#### Scenario: Owner moves a question up with the keyboard

- **GIVEN** a page with two questions and the second selected
- **WHEN** the owner presses the move-up shortcut
- **THEN** the second question precedes the first
- **AND** the document passes the survey check

### Requirement: A move to another place is refused where the place does not take the element

Moving an element to another place SHALL change nothing when that place does not take the element's kind.

#### Scenario: A question is moved into a place that refuses it

- **GIVEN** a dynamic panel and a question that is itself a dynamic panel
- **WHEN** the owner moves the second into the first's template
- **THEN** the move is refused
- **AND** the document is unchanged

### Requirement: An edit can be undone and redone

Each edit SHALL be undoable and redoable, restoring the document each time it is undone or redone.

#### Scenario: Undo after a move

- **GIVEN** the owner moved a question to another page
- **WHEN** the owner undoes
- **THEN** the question is back where it was

#### Scenario: Redo after an undone move

- **GIVEN** the owner moved a question to another page and undid the move
- **WHEN** the owner redoes
- **THEN** the question is on the other page again

#### Scenario: Typing into one property is a single undo step

- **GIVEN** a question whose title is empty
- **WHEN** the owner types "Why" into its title one character at a time and then undoes
- **THEN** the question's title is empty again
- **AND** nothing is left to undo

### Requirement: The canvas selects the element the owner chooses

The canvas SHALL select the element the owner clicks, or the focused element the owner chooses with Enter, and the layers tree SHALL show that element as current.

#### Scenario: clicking a question selects it

- **GIVEN** a page holding one question
- **WHEN** the owner clicks the question in the canvas
- **THEN** the question is the selected element

#### Scenario: Enter on a focused question selects it from the keyboard

- **GIVEN** a page holding one question
- **WHEN** the owner focuses the question and presses Enter
- **THEN** the question is the selected element

#### Scenario: choosing an element in the canvas selects the same row of the layers tree

- **GIVEN** a page holding two questions
- **WHEN** the owner clicks the second question in the canvas
- **THEN** the second question's row is the current row of the layers tree

### Requirement: The layers tree lists every element in layer order

The layers tree SHALL list every element of the survey in layer order, each row under its own pointer.

#### Scenario: the tree lists every node in layer order, each row under its own pointer

- **GIVEN** a page holding a panel, and the panel holding a question
- **WHEN** the owner opens the Creator
- **THEN** the tree lists the page, the panel and the question in that order

### Requirement: The design and preview switch changes what the canvas draws

The Design or Preview switch SHALL change the canvas between the editor and the survey as a respondent sees it.

#### Scenario: the Preview choice makes the store preview the survey, and Design takes it back

- **GIVEN** the owner is editing the survey in Design
- **WHEN** the owner chooses Preview and then Design
- **THEN** the canvas draws the survey as a respondent sees it, and then the editor again

### Requirement: An imported document that fails the survey check is refused

An import SHALL be refused, leaving the open survey unchanged, when its content does not pass the survey check, and the refusal SHALL name the path of the first fault.

#### Scenario: Import with a duplicate name

- **GIVEN** a file holding a survey whose two questions share a name
- **WHEN** the owner imports it
- **THEN** the import is refused with the second question's path
- **AND** the open survey is unchanged
