## Purpose

The question fields a respondent answers a survey with: each question kind drawn from the app's UI library, labelled by its title, operable by keyboard, and showing the message the runner gives it.

## Requirements

### Requirement: Every question is labelled by its title and operable by keyboard

A question field SHALL be labelled by the question's title and answerable by keyboard alone, in both design styles.

#### Scenario: answers with the choice an arrow key moves to

- **GIVEN** a radio group question titled "Favourite colour" with three choices
- **WHEN** a respondent moves to it by the keyboard and picks a choice with the arrow keys
- **THEN** the answer holds the chosen value
- **AND** the group's accessible label is "Favourite colour"

#### Scenario: A ranking question is reordered by keyboard

- **GIVEN** a ranking question with three choices
- **WHEN** a respondent moves the third choice up with Alt and the up arrow
- **THEN** the answer lists it second

### Requirement: A question that fails a check shows its message beside the field

A question field SHALL show the message the runner gives its question beside the control, marking the control invalid for assistive technology.

#### Scenario: shows its error beside it and marks it invalid

- **GIVEN** a text question that the runner gives an error message
- **WHEN** the field is drawn with that error
- **THEN** the message is shown as an alert beside the field
- **AND** the input is marked invalid

### Requirement: The page renderer walks a survey's pages and shows what blocks a move

The page renderer SHALL move a respondent between a survey's visible pages and, when a move is refused, show the refusal as an alert and move focus to the first question that blocks it.

#### Scenario: walks a two-page document forward and back, keeping the first page's answer, and offers Complete on the last page

- **GIVEN** a survey of two pages
- **WHEN** the respondent answers the first page, goes to the next page and then back
- **THEN** the first page shows its answer again
- **AND** the second page offers Complete in place of Next

#### Scenario: a failed next shows its message and moves focus to the page's first blocking question

- **GIVEN** a page of two required questions that are both unanswered
- **WHEN** the respondent goes to the next page
- **THEN** the refusal is shown as an alert
- **AND** focus moves to the first of the two questions
