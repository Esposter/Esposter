## ADDED Requirements

### Requirement: A response is stored under the name of each question it answers

A respondent's answers SHALL be stored keyed by the name of the question each answers, and the Responses blade, the summary and the dataset SHALL read them by that name.

#### Scenario: A respondent answers a survey

- **GIVEN** a survey with a question named "rating"
- **WHEN** a respondent answers that question and submits
- **THEN** the stored response holds the answer under the key "rating"
- **AND** the Responses blade shows it in the column named "rating"

### Requirement: The server refuses an answer the question does not accept

A response write SHALL be refused when an answer is not one its question accepts, and a submit SHALL also be refused when a visible required question is unanswered, with the same message the respondent's page shows.

#### Scenario: An answer outside a rating's scale

- **GIVEN** a published survey with a rating question of five steps
- **WHEN** a response is written with the answer 9 for that question
- **THEN** the write is refused
- **AND** the refusal names the question

#### Scenario: A draft is saved with a required question unanswered

- **GIVEN** a published survey with a required question
- **WHEN** a respondent's draft is saved without an answer to it
- **THEN** the draft is stored
