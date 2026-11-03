## ADDED Requirements

### Requirement: An expression evaluates to the value SurveyJS gives it

An expression over a record of answers SHALL evaluate to the value SurveyJS's expression runner gives for the same expression and answers, for every operator and function the package implements.

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

### Requirement: A malformed expression is refused with the position of the fault

Checking an expression that is not in the language, or that calls a function the language lacks, SHALL return an error holding a message and the character position of the fault, and SHALL return no tree.

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
