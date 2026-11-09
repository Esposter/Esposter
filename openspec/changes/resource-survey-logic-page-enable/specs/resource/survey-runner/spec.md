## ADDED Requirements

### Requirement: A page whose enable condition does not hold draws its questions disabled

The runner SHALL draw every question of a page as disabled while the page's enable condition does not hold.

#### Scenario: A page disabled by its condition draws its questions disabled

- **GIVEN** a survey whose second page is enabled only when the first question is answered "yes", and the first question is not answered "yes"
- **WHEN** the respondent moves to the second page
- **THEN** the questions on the second page are drawn disabled

#### Scenario: Answering yes enables the second page's questions

- **GIVEN** the respondent is on the first page with the second page's questions drawn disabled
- **WHEN** the respondent answers "yes" to the first question
- **THEN** the questions on the second page are drawn enabled

### Requirement: A question on a disabled page is not checked on a move or a submit

The runner SHALL NOT check a question on a page whose enable condition does not hold when the respondent moves off that page or submits the survey.

#### Scenario: A required question on a disabled page does not block the move

- **GIVEN** a second page disabled by its condition, with a required question on it left empty
- **WHEN** the respondent moves to the next page
- **THEN** the move is allowed

#### Scenario: A submit leaves a disabled page's required question empty

- **GIVEN** a second page disabled by its condition, with a required question on it left empty
- **WHEN** the respondent submits the survey
- **THEN** the server accepts the submit
- **AND** the response holds no answer for that question
