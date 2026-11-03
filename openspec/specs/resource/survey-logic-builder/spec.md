# resource/survey-logic-builder Specification

## Purpose

The Logic tab's conditions, built from rows or typed as an expression beside them, and the survey's calculated values, each checked against the questions and values the survey already holds.

## Requirements

### Requirement: A condition built from rows is written as an expression

The Logic tab SHALL write the condition its rows describe as an expression, which a respondent's answers evaluate as the rows say.

#### Scenario: Owner adds a row and types its value

- **GIVEN** a survey whose first question is named "a" and whose second question is selected in the Logic tab
- **WHEN** the owner adds a condition to the second question and types "yes" as its value
- **THEN** the second question's visibility condition reads that the first question equals "yes"

#### Scenario: A built condition evaluates true and false on the answers it reads

- **GIVEN** a condition built from rows: question "a" equals "a" and question "b" does not equal "a"
- **WHEN** a respondent answers "a" with "a" and "b" with "b"
- **THEN** the condition holds
- **AND** when the respondent answers "a" with "b", the condition does not hold

### Requirement: A typed expression that does not parse is shown its error and not saved

A typed expression that does not parse SHALL be shown its error beside the field, and the saved condition SHALL stay as it was.

#### Scenario: an expression that does not parse shows its error and saves nothing

- **GIVEN** a question whose visibility condition is `{a} > 5`
- **WHEN** the owner changes the expression to `{a} >`
- **THEN** the field shows "Expected an expression at character 6"
- **AND** the saved visibility condition is still `{a} > 5`

### Requirement: Calculated values are named and set in the Logic tab

The Logic tab SHALL let the owner name each calculated value, and SHALL refuse a name that a question or another value already holds.

#### Scenario: a name that collides with a question is refused with the survey check's message and saves nothing

- **GIVEN** a survey with a question named "a" and a calculated value named "b"
- **WHEN** the owner names the calculated value "a"
- **THEN** the field shows the survey check's message for that name
- **AND** the survey keeps only the calculated value "b"

#### Scenario: a calculated value added takes a name no answer or value holds

- **GIVEN** a survey with a question named "a" and a calculated value named "b"
- **WHEN** the owner adds a calculated value
- **THEN** the survey's calculated values are "b" and then "value"
