## Purpose

Close a survey without unpublishing it — an accepting-responses toggle enforced server-side, with a polite closed state on the respondent page.

## Requirements

### Requirement: Closing a survey keeps its public link working

The owner SHALL be able to stop accepting responses without unpublishing the survey, so its public link keeps working.

#### Scenario: Owner closes a published survey

- **GIVEN** a survey is published and accepting responses
- **WHEN** the owner turns off accepting responses
- **THEN** the public link still opens the survey's page
- **AND** the page shows the closed state

### Requirement: The closed page shows the owner's message or a default

A closed survey's public page SHALL show a closed message, using the owner's message when one is set and a default message otherwise.

#### Scenario: Owner has set a closed message

- **GIVEN** the owner has set a closed message
- **WHEN** a respondent opens the closed survey
- **THEN** the page shows the owner's message

#### Scenario: No closed message set

- **GIVEN** the owner has not set a closed message
- **WHEN** a respondent opens the closed survey
- **THEN** the page shows the default closed message

### Requirement: Closing and reopening take effect without publishing again

Closing or reopening a survey SHALL take effect at once without publishing again.

#### Scenario: Owner reopens a closed survey

- **GIVEN** a survey is closed while published
- **WHEN** the owner turns accepting responses back on
- **THEN** respondents can answer without the survey being published again

### Requirement: Responses are refused while the survey is closed

A response submitted to a closed survey SHALL be refused, including a response whose form was open when the survey closed.

#### Scenario: Respondent submits after the survey closed

- **GIVEN** a respondent had the form open when the survey was closed
- **WHEN** the respondent submits an answer
- **THEN** the submission is refused
- **AND** the respondent is told the survey is no longer accepting responses

### Requirement: The closed message has a maximum length

The closed message SHALL be limited to a maximum length.

#### Scenario: Owner types a message that is too long

- **GIVEN** the owner is writing a closed message
- **WHEN** the message exceeds the maximum length
- **THEN** the message is not saved beyond the maximum length

### Requirement: The closed message field appears only while closed

The closed message field SHALL appear only while the survey is closed.

#### Scenario: Survey is open

- **GIVEN** the survey is accepting responses
- **WHEN** the owner views the Collection settings
- **THEN** the closed message field is not shown

#### Scenario: Survey is closed

- **GIVEN** the survey is not accepting responses
- **WHEN** the owner views the Collection settings
- **THEN** the closed message field is shown
