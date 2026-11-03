## ADDED Requirements

### Requirement: A question is shown only when its visibility condition holds

The runner SHALL show a question only when its visibility condition holds over the current answers, and a question with no condition is always shown.

#### Scenario: an answer reveals a follow-up question, and answering again hides it

- **GIVEN** a survey whose second question is shown only when the first is answered "yes"
- **WHEN** the respondent answers "yes" to the first question
- **THEN** the second question is shown
- **AND** answering "no" hides it again

### Requirement: A required question blocks its page until it is answered

The runner SHALL refuse to move past a page while a visible required question on it is unanswered, reporting each such question with its message and naming the first one for focus.

#### Scenario: a required question left empty refuses the move and keeps the same state

- **GIVEN** a page with two visible required questions, both unanswered
- **WHEN** the respondent moves to the next page
- **THEN** the move is refused and the state is unchanged
- **AND** both questions report an error, and the first is named for focus

#### Scenario: a required question that is hidden does not block the move

- **GIVEN** a required question whose visibility condition does not hold
- **WHEN** the respondent moves to the next page
- **THEN** the move is allowed

### Requirement: A page with no visible element is skipped

The runner SHALL skip a page in which no element is visible when moving forward or back.

#### Scenario: a page hidden by a condition is skipped

- **GIVEN** a survey whose second page is hidden by its condition
- **WHEN** the respondent moves forward from the first page
- **THEN** the third page is current

#### Scenario: a move back skips a page hidden by a condition

- **GIVEN** a survey whose middle page is hidden by its condition
- **WHEN** the respondent moves back from the last page
- **THEN** the first page is current

### Requirement: A completed survey keeps only the answers of visible questions

The runner SHALL keep, on completion, only the answers of visible questions and the calculated values that the result includes.

#### Scenario: a hidden question's earlier answer is dropped on completion

- **GIVEN** a respondent who answered a question and then changed an earlier answer so the question is hidden
- **WHEN** the respondent completes the survey
- **THEN** the completed answers hold no entry for the hidden question

#### Scenario: the result holds each calculated value flagged for it and each visible calculated-value question

- **GIVEN** a survey with a calculated value flagged for the result and a visible calculated-value question
- **WHEN** the respondent completes the survey
- **THEN** the completed answers hold the value of each of them

### Requirement: A survey with an error on a shown page does not complete

The runner SHALL refuse to complete a survey while a shown page holds an error, and SHALL return the first such page with its errors, with the state moved to that page and unfinished.

#### Scenario: the first page with errors is returned, and the state moves to it unfinished

- **GIVEN** a survey whose second page has a required question left empty
- **WHEN** the respondent completes the survey
- **THEN** the completion reports the required question's error
- **AND** the state is on the second page and is not completed
