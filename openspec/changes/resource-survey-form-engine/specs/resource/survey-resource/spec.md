## ADDED Requirements

### Requirement: A survey's questions are uniquely named and of a type the engine offers

A survey save SHALL be refused when two of its questions share a name, or when a question's type is not one the survey's engine offers, and the refusal SHALL name the question at fault. A survey that satisfies both rules SHALL save as it did before.

#### Scenario: Two questions share a name

- **GIVEN** the owner is editing a survey
- **WHEN** the owner saves a survey whose two questions have the same name
- **THEN** the save is refused
- **AND** the refusal names the second question

#### Scenario: A question has a type the engine does not offer

- **GIVEN** an agent is writing a survey's model
- **WHEN** the agent writes a question whose type the survey engine does not offer
- **THEN** the write is refused
- **AND** the refusal names the question

#### Scenario: A stored survey that satisfies the rules still saves

- **GIVEN** a survey whose questions are uniquely named and of offered types
- **WHEN** the owner saves it without changing its questions
- **THEN** the save succeeds
