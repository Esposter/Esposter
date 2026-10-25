## ADDED Requirements

### Requirement: A Blueprint's webpage and email entries deploy as fresh documents

The cutover SHALL remove the editor content from each Blueprint entry of webpage or email type, so that deploying the entry creates an empty document.

#### Scenario: A Blueprint's webpage entry deploys as a fresh document

- **GIVEN** a Blueprint whose captured entry is a webpage
- **WHEN** an owner deploys the Blueprint after the cutover
- **THEN** the deployed webpage starts as an empty document

#### Scenario: A Blueprint revision from before the cutover is refused

- **GIVEN** a Blueprint revision saved before the cutover that holds a webpage entry with editor content
- **WHEN** an owner deploys that revision
- **THEN** the deploy fails for that entry with the parse error
