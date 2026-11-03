## ADDED Requirements

### Requirement: Choices are edited from the property panel

The property panel of a choice question SHALL let the owner add, reorder and remove its choices, each change reaching the survey's document.

#### Scenario: Owner adds and reorders choices

- **GIVEN** a radio group question with two choices selected in the Creator
- **WHEN** the owner adds a third choice and moves it to the top with the keyboard
- **THEN** the question's choices list the new choice first

#### Scenario: Owner removes a choice

- **GIVEN** a radio group question with two choices selected in the Creator
- **WHEN** the owner removes the first choice
- **THEN** the question's choices list only the second choice

#### Scenario: Owner pastes several lines as choices

- **GIVEN** a radio group question with no choices selected in the Creator
- **WHEN** the owner pastes the lines "green" and "yellow|Yellow" into the add field
- **THEN** each line becomes one choice, with its own value and text

#### Scenario: A duplicate choice value is refused

- **GIVEN** a radio group question with a choice valued "red"
- **WHEN** the owner adds another choice valued "red"
- **THEN** the panel shows that choice values must be unique
- **AND** the document is unchanged

#### Scenario: An edited value that is refused stays in its field

- **GIVEN** a radio group question with a choice valued "red"
- **WHEN** the owner clears the value of that choice
- **THEN** the panel shows that a choice needs a value
- **AND** the document is unchanged

### Requirement: A dynamic matrix's columns are edited from the property panel

The property panel of a dynamic matrix SHALL let the owner add, rename and remove its columns.

#### Scenario: Owner adds, renames and removes a matrix column

- **GIVEN** a dynamic matrix question selected in the Creator
- **WHEN** the owner adds a column titled "Often", renames it to "Sometimes" and removes it
- **THEN** the matrix's columns follow each of those changes

### Requirement: A dynamic matrix column's cell type is set in the property panel

The property panel of a dynamic matrix SHALL let the owner set each column's cell type.

#### Scenario: Owner sets a column's cell type to dropdown

- **GIVEN** a dynamic matrix question with a text column selected in the Creator
- **WHEN** the owner sets the column's cell type to dropdown
- **THEN** the column's cell type is dropdown
- **AND** the column offers its own choices

### Requirement: A multiple text question's items are edited from the property panel

The property panel of a multiple text question SHALL let the owner add items and set each item's input type.

#### Scenario: Owner adds an item and gives it an input type

- **GIVEN** a multiple text question selected in the Creator
- **WHEN** the owner adds an item named "Email" and gives it the email input type
- **THEN** the question's items hold the item with the email input type

### Requirement: With nothing selected, the property panel edits the survey's texts

With nothing selected, the property panel SHALL edit the survey's own texts and offer no logo, colour or calculated value.

#### Scenario: with nothing selected, the root's form writes the survey's own texts

- **GIVEN** the survey with nothing selected in the Creator
- **WHEN** the owner renames the survey's title
- **THEN** the survey's title is the new title
- **AND** the panel offers no logo, colour or calculated value

### Requirement: A form edit reaches the document only when the schema accepts it

The property form SHALL write a changed value to the document only when the schema accepts it.

#### Scenario: A form edit writes the props it changed

- **GIVEN** a question selected in the Creator
- **WHEN** the owner renames the question
- **THEN** the question has the new name

#### Scenario: A value the schema refuses stays in the form and is not written

- **GIVEN** a question selected in the Creator
- **WHEN** the owner types a name the schema refuses
- **THEN** the question keeps its name
