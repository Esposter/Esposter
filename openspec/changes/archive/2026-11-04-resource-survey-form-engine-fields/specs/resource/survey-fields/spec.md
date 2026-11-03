## ADDED Requirements

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
