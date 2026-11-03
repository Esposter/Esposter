## ADDED Requirements

### Requirement: A condition built from rows is written as an expression

The Logic tab SHALL write the expression for the rows the owner builds, each an answer, an operator and a value, and a respondent's answers SHALL evaluate it as the rows say.

#### Scenario: Owner shows a question when another is answered yes

- **GIVEN** a survey whose second question is selected in the Logic tab
- **WHEN** the owner builds the visibility condition "first question equals yes"
- **THEN** the second question is shown only when the first is answered "yes"
- **AND** the raw expression beside the rows reads the condition

### Requirement: A raw expression that does not parse is shown its error and not saved

Typing an expression that does not parse SHALL show the error and its position beside the field, and SHALL leave the survey's saved condition unchanged.

#### Scenario: Owner types an unfinished expression

- **GIVEN** a question with the visibility condition `{age} > 5`
- **WHEN** the owner changes the raw expression to `{age} >`
- **THEN** the field shows the parse error
- **AND** the saved condition is still `{age} > 5`
