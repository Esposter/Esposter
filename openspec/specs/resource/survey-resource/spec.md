## Purpose

SurveyJS authoring as a resource — inline creator Editor blade, Responses dataset blade, and a public respondent page as the published view.

## Requirements

### Requirement: The owner edits a survey's questions inline

The owner SHALL edit a survey's questions in an editor shown inline on the resource page.

#### Scenario: Owner opens the survey editor

- **GIVEN** the owner has a survey
- **WHEN** the owner opens its editor
- **THEN** the survey's questions are editable on the page

### Requirement: Survey edits save automatically

Edits to a survey SHALL be saved automatically as the owner works.

#### Scenario: Owner adds a question

- **GIVEN** the owner has the survey editor open
- **WHEN** the owner adds a question and pauses
- **THEN** the survey is saved without a separate save action

### Requirement: Publishing freezes the questions the public sees

Publishing a survey SHALL freeze the questions the public sees until the owner publishes again.

#### Scenario: Owner edits after publishing

- **GIVEN** a survey is published
- **WHEN** the owner edits its questions without publishing again
- **THEN** the public page still shows the questions as published

### Requirement: A published survey answers at its public page

A published survey SHALL be answerable at its public page, and an unpublished survey's public page SHALL show not found.

#### Scenario: Respondent opens a published survey

- **GIVEN** a survey is published
- **WHEN** a respondent opens its public page
- **THEN** the respondent can answer the questions

#### Scenario: Respondent opens an unpublished survey

- **GIVEN** a survey is not published
- **WHEN** a respondent opens its public page
- **THEN** the page shows not found

### Requirement: The Responses blade lists each submitted response

The Responses blade SHALL list each submitted response as a row.

#### Scenario: Owner opens Responses

- **GIVEN** a survey has submitted responses
- **WHEN** the owner opens the Responses blade
- **THEN** each submitted response is a row

### Requirement: A survey's responses are available only to its owner

A survey's responses SHALL be readable only by the survey's owner, including when other resources read them as a dataset.

#### Scenario: Another user reads responses as a dataset

- **GIVEN** a survey belongs to one user
- **WHEN** a different user tries to read its responses as a dataset
- **THEN** the read is refused

### Requirement: A respondent can resume an unfinished answer on the same device

A respondent SHALL be able to resume an unfinished answer on the same device.

#### Scenario: Respondent returns to an unfinished answer

- **GIVEN** a respondent answered some questions and left
- **WHEN** the respondent returns on the same device
- **THEN** the answers already given are shown

### Requirement: A submitted response cannot be reopened on a shared device

A submitted response SHALL NOT be reopened by a later visitor on the same device.

#### Scenario: Later visitor on a shared device

- **GIVEN** a respondent submitted a response on a shared device
- **WHEN** a later visitor opens the survey on that device
- **THEN** the submitted answers are not shown

### Requirement: Uploaded images can be used in questions and branding

A survey SHALL accept uploaded images for its image questions, logos and theme backgrounds.

#### Scenario: Owner adds an image question

- **GIVEN** the owner is editing a survey
- **WHEN** the owner uploads an image for an image question
- **THEN** the image appears in the question

### Requirement: Email invitations link to the survey's public page

Email invitations for a survey SHALL link to the survey's public page.

#### Scenario: Owner sends an invitation

- **GIVEN** a survey is published
- **WHEN** an invitation is sent for it
- **THEN** the invitation contains a link to the survey's public page
