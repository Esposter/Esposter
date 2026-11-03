## ADDED Requirements

### Requirement: Every question is labelled by its title and operable by keyboard

Each question field SHALL carry the question's title as its accessible label, and SHALL be answerable using the keyboard alone, in both design styles.

#### Scenario: A choice question is answered by keyboard

- **GIVEN** a radio group question titled "Favourite colour" with three choices
- **WHEN** a respondent moves to it by the keyboard and picks a choice with the arrow and space keys
- **THEN** the answer holds the chosen value
- **AND** the group's accessible label is "Favourite colour"

#### Scenario: A ranking question is reordered by keyboard

- **GIVEN** a ranking question with three choices
- **WHEN** a respondent moves the third choice up with the keyboard
- **THEN** the answer lists it second

### Requirement: A question that fails a check shows its message beside the field

A field SHALL show the runner's message for its question beside the field and SHALL mark the field invalid for assistive technology.

#### Scenario: A required question is left empty

- **GIVEN** a required text question the respondent left empty
- **WHEN** the respondent tries to move to the next page
- **THEN** the question shows its required message
- **AND** the field is marked invalid and receives focus
