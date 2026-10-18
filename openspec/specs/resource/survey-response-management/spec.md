## Purpose

Owner-side response operations on the Responses blade — per-response detail, delete, and a response count on the Overview summary.

## Requirements

### Requirement: The Overview shows the number of responses

The Overview of a survey SHALL show how many responses it has, with a link to the Responses blade.

#### Scenario: Owner opens the Overview

- **GIVEN** a survey has responses
- **WHEN** the owner opens its Overview
- **THEN** the response count is shown
- **AND** following it opens the Responses blade

### Requirement: A count above the countable maximum shows as beyond the maximum

A response count above the maximum that can be counted SHALL display as more than that maximum.

#### Scenario: More responses than can be counted

- **GIVEN** a survey has more responses than the maximum that can be counted
- **WHEN** the owner opens its Overview
- **THEN** the count is shown as the maximum followed by a plus sign

### Requirement: The owner can open one response to see its answers

The owner SHALL be able to open a single response to see each question with its answer.

#### Scenario: Owner opens a response

- **GIVEN** a survey has a response
- **WHEN** the owner opens its detail
- **THEN** each question is listed with the respondent's answer

### Requirement: The owner can delete one response after confirming

The owner SHALL be able to delete a single response after confirming the deletion.

#### Scenario: Owner deletes a response

- **GIVEN** a survey has a response
- **WHEN** the owner deletes it and confirms
- **THEN** the response is removed from the responses

#### Scenario: Deleting a response that no longer exists

- **GIVEN** a response was already deleted
- **WHEN** the owner deletes it again
- **THEN** an error is reported
- **AND** nothing else is removed

### Requirement: Only the survey's owner can manage its responses

Only the survey's owner SHALL be able to delete its responses.

#### Scenario: Another user tries to delete a response

- **GIVEN** a survey belongs to one user
- **WHEN** a different user tries to delete one of its responses
- **THEN** the deletion is refused

### Requirement: Unfinished responses are hidden from every count and list

An unfinished response SHALL NOT appear in the count, the Responses list, the dataset or the funnel until the respondent submits it.

#### Scenario: Respondent answers one question and leaves

- **GIVEN** a respondent answered one question and left without submitting
- **WHEN** the owner views the count and the Responses list
- **THEN** that unfinished response is not counted or listed

### Requirement: The owner cannot edit a respondent's answers

The owner SHALL NOT be able to edit a respondent's answers.

#### Scenario: Owner looks for an edit action

- **GIVEN** the owner has opened a response
- **WHEN** the owner looks for a way to change its answers
- **THEN** no edit action is offered

### Requirement: The Responses blade does not offer deleting all responses

The Responses blade SHALL NOT offer deleting all responses at once.

#### Scenario: Owner looks for delete all

- **GIVEN** the owner is on the Responses blade
- **WHEN** the owner looks for a way to delete every response
- **THEN** no delete-all action is offered

### Requirement: A delete removes the response the owner selected

A delete SHALL remove the response the owner selected, even when responses were added or removed since the table loaded.

#### Scenario: Responses change while the table is open

- **GIVEN** the owner has the Responses table open
- **AND** a new response was submitted after the table loaded
- **WHEN** the owner deletes a response from the table
- **THEN** the response the owner selected is the one removed
