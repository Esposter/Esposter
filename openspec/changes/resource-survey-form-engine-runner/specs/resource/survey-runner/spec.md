## ADDED Requirements

### Requirement: A question is shown only when its visibility condition holds

The runner SHALL show a question only when its visibility condition evaluates to true over the current answers, and a question with no condition SHALL always be shown.

#### Scenario: An answer reveals a follow-up question

- **GIVEN** a survey whose second question is shown only when the first is answered "yes"
- **WHEN** the respondent answers "yes" to the first question
- **THEN** the second question is shown
- **AND** answering "no" hides it again

### Requirement: A required question blocks its page until it is answered

The runner SHALL refuse to move past a page while a visible required question on it is unanswered, SHALL report each such question with its message, and SHALL name the first one so focus can move to it.

#### Scenario: A required question is left empty

- **GIVEN** a page with two visible required questions, both unanswered
- **WHEN** the respondent moves to the next page
- **THEN** the move is refused
- **AND** both questions report an error and the first is named for focus

#### Scenario: A required question that is hidden does not block

- **GIVEN** a required question whose visibility condition is false
- **WHEN** the respondent moves to the next page
- **THEN** the move is allowed

### Requirement: A page with no visible element is skipped

The runner SHALL skip a page in which no element is visible when moving forward or back.

#### Scenario: A page is hidden by a condition

- **GIVEN** a survey whose second page is hidden by its condition
- **WHEN** the respondent moves forward from the first page
- **THEN** the third page is current

### Requirement: A completed survey keeps only the answers of visible questions

On completion the runner SHALL drop the answer of every question that is not visible and SHALL include each calculated value that is included in the result.

#### Scenario: A hidden question's earlier answer is dropped

- **GIVEN** a respondent who answered a question and then changed an earlier answer so the question is hidden
- **WHEN** the respondent completes the survey
- **THEN** the completed answers hold no entry for the hidden question
