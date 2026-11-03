## ADDED Requirements

### Requirement: Choices are edited from the property panel

The property panel of a choice question SHALL let the owner add, reorder and remove choices, and SHALL write each change to the survey's document.

#### Scenario: Owner adds and reorders choices

- **GIVEN** a radio group question with two choices selected in the Creator
- **WHEN** the owner adds a third choice and moves it to the top with the keyboard
- **THEN** the question's choices list the new choice first
- **AND** the change is a single undoable edit each

#### Scenario: A duplicate choice value is refused

- **GIVEN** a radio group question with a choice valued "red"
- **WHEN** the owner adds another choice valued "red"
- **THEN** the panel shows that choice values must be unique
- **AND** the document is unchanged

### Requirement: A matrix's rows and columns are edited from the property panel

The property panel of a matrix SHALL let the owner add, rename and remove its rows and columns, and the panel of a dynamic matrix SHALL let the owner set each column's cell type.

#### Scenario: Owner adds a matrix column

- **GIVEN** a matrix question selected in the Creator
- **WHEN** the owner adds a column titled "Often"
- **THEN** the matrix has a column titled "Often"
