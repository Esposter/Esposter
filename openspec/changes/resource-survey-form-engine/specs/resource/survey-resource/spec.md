## ADDED Requirements

### Requirement: A survey's questions are uniquely named and of a kind the survey offers

A survey save SHALL be refused when two of its questions share a name, or when a question's kind is not one the survey offers, and the refusal SHALL name the question at fault. A survey whose questions satisfy both rules SHALL save.

#### Scenario: Two questions share a name

- **GIVEN** the owner is editing a survey
- **WHEN** the owner saves a survey whose two questions have the same name
- **THEN** the save is refused
- **AND** the refusal names the second question

#### Scenario: A question has a kind the survey does not offer

- **GIVEN** an agent is writing a survey's model
- **WHEN** the agent writes a question whose kind the survey does not offer
- **THEN** the write is refused
- **AND** the refusal names the question

### Requirement: A response is stored under the name of each question it answers

A respondent's answers SHALL be stored keyed by the name of the question each answers, and the Responses blade, the summary and the dataset SHALL read them by that name.

#### Scenario: A respondent answers a survey

- **GIVEN** a survey with a question named "rating"
- **WHEN** a respondent answers that question and submits
- **THEN** the stored response holds the answer under the key "rating"
- **AND** the Responses blade shows it in the column named "rating"
