## ADDED Requirements

### Requirement: A rating card's bars run from the first step of its scale

A rating card SHALL bar each step from the first step of its scale to its last, so a rating that starts at zero counts its zero answers.

#### Scenario: A rating that starts at zero counts its zero answers

- **GIVEN** a rating question of three steps that starts at zero, with responses of zero, two and two
- **WHEN** the owner reads the summary
- **THEN** the bars are labelled zero, one and two
- **AND** the bar for zero counts one response and the bar for two counts two

#### Scenario: A rating that starts at one is counted as before

- **GIVEN** a rating question of three steps that starts at one, with responses of one and three
- **WHEN** the owner reads the summary
- **THEN** the bars are labelled one, two and three
