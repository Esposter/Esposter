# resource/survey-respondent Specification

## Purpose

The public respondent page of a survey: the answers a respondent gives and keeps, the answers the server takes, and the submit that completes a response.

## Requirements

### Requirement: A response is stored under the name of each question it answers

A respondent's answers SHALL be stored keyed by the name of the question each answers. The Responses blade, the summary and the dataset read them by that name.

#### Scenario: A respondent answers a survey

- **GIVEN** a survey with a question named "rating"
- **WHEN** a respondent answers that question and submits
- **THEN** the stored response holds the answer under the key "rating"
- **AND** the Responses blade shows it in the column named "rating"

### Requirement: The server refuses an answer its question does not accept

A response write that breaks the rule of the question its answer belongs to, or names a question the published survey does not hold, SHALL be refused with a message that names the question and gives the message of the rule it broke.

#### Scenario: refuses a rating outside its scale, naming the question

- **GIVEN** a published survey with a rating question of five steps
- **WHEN** a response is written with the answer 9 for that question
- **THEN** the write is refused
- **AND** the refusal names the question

### Requirement: The server refuses a submit that leaves a required question unanswered

A submit SHALL be refused when a visible required question is unanswered. A draft that leaves one unanswered is still stored.

#### Scenario: saves a draft with a required question unanswered, and refuses the submit for it

- **GIVEN** a published survey with a required question
- **WHEN** a respondent's draft is saved without an answer to it
- **THEN** the draft is stored
- **AND** the same answers submitted are refused
