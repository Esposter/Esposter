## ADDED Requirements

### Requirement: A rating answer is a step of its scale

A rating answer SHALL be a whole step from the first step of its scale to its last.

#### Scenario: A scale that starts at zero accepts zero

- **GIVEN** a rating question whose scale starts at zero and has five steps
- **WHEN** the respondent answers zero and moves to the next page
- **THEN** the move is allowed
- **AND** the answer zero is kept

#### Scenario: A stored rating above a shortened scale blocks the move

- **GIVEN** a respondent who answered four on a rating question of five steps
- **WHEN** the owner shortens the scale to three steps and the respondent moves to the next page
- **THEN** the move is refused
- **AND** the question shows that its answer is out of range

### Requirement: A selection holds within its minimum and maximum

A selection question's answer SHALL name no fewer choices than its minimum selection and no more than its maximum.

#### Scenario: A tag box below its minimum blocks the move

- **GIVEN** a tag box whose minimum selection is two, with one choice picked
- **WHEN** the respondent moves to the next page
- **THEN** the move is refused
- **AND** the question asks for more choices

#### Scenario: A selection within its bounds moves on

- **GIVEN** a tag box whose minimum selection is two, with two choices picked
- **WHEN** the respondent moves to the next page
- **THEN** the move is allowed
