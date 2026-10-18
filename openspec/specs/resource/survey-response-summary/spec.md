## Purpose

The Responses blade opens on a Summary of every question — a bar chart per choice, a number's range and average, or a written question's answers — computed from the responses already read, as Google Forms' Summary tab does.

## Requirements

### Requirement: Summary view opens first

The Responses blade SHALL open on a Summary view with one card per question, in the survey's own question order.

#### Scenario: Owner opens the Responses blade

- **GIVEN** a survey with at least one response
- **WHEN** the owner opens the survey's Responses blade
- **THEN** the Summary view is shown before the Individual view
- **AND** it holds one card for each question, in the survey's order

### Requirement: Choice questions show counts and shares

A choice question's card SHALL show a bar for each choice, labelled with the number of responses that picked it and its share of the responses that answered the question.

#### Scenario: Choice bars are labelled

- **GIVEN** a single-choice, dropdown or yes-or-no question answered by some respondents
- **WHEN** the Summary view is shown
- **THEN** each choice has a bar labelled with its count and its share
- **AND** each choice is shown by its label rather than its stored value

#### Scenario: Multiple-choice shares can total more than one hundred percent

- **GIVEN** a checkbox question where respondents picked several choices
- **WHEN** the Summary view is shown
- **THEN** each choice's share is of all respondents who answered the question
- **AND** the shares together can pass one hundred percent

### Requirement: Rating questions show a distribution and an average

A rating question's card SHALL show a bar for each rating value and the average rating.

#### Scenario: Rating card with responses

- **GIVEN** a rating question with responses
- **WHEN** the Summary view is shown
- **THEN** each rating value has a bar labelled with its count
- **AND** the average of the ratings is shown

### Requirement: Numeric written answers show a range and an average

A text question with a numeric input SHALL show the minimum, average and maximum of its answers on its card.

#### Scenario: Numeric question card

- **GIVEN** a text question whose input is numeric and has responses
- **WHEN** the Summary view is shown
- **THEN** its minimum, average and maximum are shown

### Requirement: Written answers show a first sample and a path to the rest

A written question's card SHALL list the first answers read and offer a way to the Individual view for the rest.

#### Scenario: Written question with more answers than the list shows

- **GIVEN** a comment or text question answered by many respondents
- **WHEN** the Summary view is shown
- **THEN** the first answers are listed
- **AND** a button opens the Individual view for all of the answers

### Requirement: Each card counts only the responses that answered its question

Each question's card SHALL be headed by the question's title and the number of responses that answered that question.

#### Scenario: Optional question skipped by some respondents

- **GIVEN** an optional question that some respondents left blank
- **WHEN** the Summary view is shown
- **THEN** the card's count includes only the responses that answered that question

### Requirement: Descriptive elements have no card

Only questions that the survey's responses hold an answer column for SHALL have a summary card.

#### Scenario: Descriptive element in the survey

- **GIVEN** a survey containing a descriptive element that collects no answer
- **WHEN** the Summary view is shown
- **THEN** no card is shown for that element

### Requirement: An unreadable survey does not hide the responses

When the survey cannot be read, the Summary view SHALL show the error while the Individual view still lists the responses.

#### Scenario: Survey content cannot be read

- **GIVEN** a survey whose content fails to load
- **WHEN** the owner opens the Responses blade
- **THEN** the Summary view shows the error
- **AND** the Individual view still lists the responses

### Requirement: The truncation alert covers the summary

When a survey has more responses than the read limit, the Responses blade SHALL show the truncation alert above both views.

#### Scenario: Survey past the row cap

- **GIVEN** a survey with more responses than the read limit
- **WHEN** the owner opens the Responses blade
- **THEN** the truncation alert is shown above both views
- **AND** the summary reflects only the responses that were read

### Requirement: The Summary is empty until the first response

Before a survey has any response, the Summary view SHALL show the same empty state the response table shows.

#### Scenario: Survey with no responses

- **GIVEN** a survey with no responses
- **WHEN** the owner opens the Summary view
- **THEN** the empty state is shown
