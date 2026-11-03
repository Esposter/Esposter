## ADDED Requirements

### Requirement: A survey's questions are uniquely named and of a kind the survey offers

A survey save SHALL be refused, naming the question at fault, when two of its questions share a name or one of its questions has a kind the survey does not offer.

#### Scenario: Two questions share a name

- **GIVEN** the owner is editing a survey
- **WHEN** the owner saves a survey whose two questions have the same name
- **THEN** the save is refused
- **AND** the refusal names the second question

#### Scenario: A question has a kind the survey does not offer

- **GIVEN** an agent is writing a survey's document
- **WHEN** the agent writes a question whose kind the survey does not offer
- **THEN** the write is refused
- **AND** the refusal names the question

### Requirement: An expression that does not parse is refused on save

A survey save SHALL be refused when any condition, calculated value or validator holds an expression that does not parse, and the refusal SHALL name the element and the field that holds it.

#### Scenario: A malformed condition

- **GIVEN** a survey with a question whose visibility condition is `{age} >`
- **WHEN** the survey is saved
- **THEN** the save is refused
- **AND** the refusal names the question and its visibility condition

### Requirement: A dynamic panel's template questions are named within the template

Questions inside a dynamic panel's template SHALL need names unique only among the template's own questions, so a template question MAY share a name with a question outside the panel.

#### Scenario: A template question reuses an outside name

- **GIVEN** a survey with a question named "email" on its first page
- **WHEN** the survey is saved with a dynamic panel whose template also holds a question named "email"
- **THEN** the survey is saved

#### Scenario: Two template questions share a name

- **GIVEN** a dynamic panel whose template holds two questions named "email"
- **WHEN** the survey is saved
- **THEN** the save is refused
- **AND** the refusal names the second template question
