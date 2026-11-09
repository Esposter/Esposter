## ADDED Requirements

### Requirement: A completed preview shows the answers its completion would store

A completed preview SHALL show the answers its completion would store as a table of the Responses blade's columns and cells, with a JSON view of the same answers beside it.

#### Scenario: Completing a preview shows its answers as a table

- **GIVEN** a survey with a text question answered "Ana" and a rating question answered four
- **WHEN** the owner completes the preview
- **THEN** the results list each question's column with its answer
- **AND** the rating's answer reads 4

#### Scenario: The JSON view shows the same answers

- **GIVEN** a completed preview whose results show a table
- **WHEN** the owner chooses the JSON view
- **THEN** the JSON holds the same answers, keyed by question name

#### Scenario: A calculated value flagged for the result is in the results

- **GIVEN** a survey with a calculated value flagged for the result, whose expression reads a rating of four
- **WHEN** the owner completes the preview
- **THEN** the results hold that calculated value

### Requirement: A completed preview offers a restart from the first page

A completed preview SHALL offer Preview Survey Again, which clears the answers and returns the survey to its first page.

#### Scenario: Preview Survey Again starts the survey from its first page

- **GIVEN** a completed preview showing its results
- **WHEN** the owner chooses Preview Survey Again
- **THEN** the survey shows its first page with no answers
- **AND** the results are gone

### Requirement: Leaving the preview clears its results

Leaving the preview SHALL clear its results, so the next preview starts with no answers.

#### Scenario: Leaving the preview clears its results

- **GIVEN** a completed preview showing its results
- **WHEN** the owner chooses Design and then Preview again
- **THEN** the survey shows its first page with no answers

### Requirement: Completing a preview saves no response

Completing a preview SHALL save no response, whether as a draft or as a submission.

#### Scenario: Completing a preview saves no response

- **GIVEN** a survey that already holds responses
- **WHEN** the owner completes the preview
- **THEN** the survey holds the same responses as before

### Requirement: A preview completion blocked by an error shows the error and no results

A preview completion blocked by an error SHALL show that error on its page and SHALL show no results.

#### Scenario: A preview blocked by an error shows the error and no results

- **GIVEN** a survey whose required question on its second page is unanswered
- **WHEN** the owner completes the preview
- **THEN** the preview moves to the second page and shows the question's error
- **AND** no results are shown
