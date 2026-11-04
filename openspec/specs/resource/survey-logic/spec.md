## Purpose

Parse a survey's expression text and evaluate it over the survey's answers to the value SurveyJS gives for the same expression, refusing a malformed expression with the position of its fault.

## Requirements

### Requirement: An expression evaluates to the value SurveyJS gives it

An expression over a record of answers SHALL evaluate to the value SurveyJS's expression runner gives for the same expression and answers, except for the deliberate deviations the design lists.

#### Scenario: Comparison and logic over answers

- **GIVEN** the answers `{ "age": 30, "name": "Ada" }`
- **WHEN** the expression `{age} >= 18 and {name} = 'Ada'` is evaluated
- **THEN** the value is true

#### Scenario: A list contains a value

- **GIVEN** the answers `{ "colours": ["red", "blue"] }`
- **WHEN** the expression `{colours} contains 'red'` is evaluated
- **THEN** the value is true

#### Scenario: A reference to an unanswered question is empty

- **GIVEN** an answer record with no entry for "age"
- **WHEN** the expression `{age} empty` is evaluated
- **THEN** the value is true
- **AND** the expression `{age} > 5` evaluates to false

#### Scenario: An unanswered question is unequal to a number and equal to the empty text

- **GIVEN** an answer record with no entry for "age"
- **WHEN** the expression `{age} != 5` is evaluated
- **THEN** the value is true
- **AND** the expression `{age} = ''` evaluates to true

#### Scenario: A nested answer is read by its path

- **GIVEN** the answers `{ "matrix": { "row1": { "col1": 7 } } }`
- **WHEN** the expression `{matrix.row1.col1} = 7` is evaluated
- **THEN** the value is true

#### Scenario: A chain of powers groups to the right

- **WHEN** the expression `2 ^ 3 ^ 2` is evaluated
- **THEN** the value is 512

### Requirement: A malformed expression is refused with the position of the fault

Checking an expression that is not in the language, that calls a function the language lacks, or that calls an array function's filter form, which the package does not support, SHALL refuse it with an error holding a message and the character position of the fault.

#### Scenario: An unclosed parenthesis

- **GIVEN** the text `({age} > 5`
- **WHEN** the text is checked
- **THEN** the check is refused
- **AND** the error names the position where the closing parenthesis was expected

#### Scenario: An unknown function

- **GIVEN** the text `nosuchfunction({age})`
- **WHEN** the text is checked
- **THEN** the check is refused
- **AND** the error names the function

#### Scenario: A filter form is refused at its call

- **GIVEN** the text `1 + avgInArray({matrix}, 'price', '{price} > 1')`
- **WHEN** the text is checked
- **THEN** the check is refused
- **AND** the error names the function and the position its call starts at, which is 4
