## ADDED Requirements

### Requirement: A banner offers the trial of its featured character

A banner whose featured five-star character has a trial SHALL offer that trial, and a banner with no trial SHALL offer none.

#### Scenario: A banner with a trial's character offers that trial

- **GIVEN** a banner whose featured five-star is a character with a trial
- **WHEN** the Wish screen shows the banner
- **THEN** the banner shows a trial button for that trial

#### Scenario: A banner with no trial offers none

- **GIVEN** a banner whose featured five-star has no trial
- **WHEN** the Wish screen shows the banner
- **THEN** the banner shows no trial button

### Requirement: A trial fights at its preset state

A trial's party SHALL be its character at the trial's level, with the talent level and the artifacts its template gives.

#### Scenario: The trial character is at the trial's level

- **GIVEN** a trial of a character at level eighty-five
- **WHEN** the trial's party is built
- **THEN** the character is at level eighty-five

#### Scenario: The trial character takes its template's artifacts

- **GIVEN** a trial at a level whose template gives five reliquaries
- **WHEN** the trial's party is built
- **THEN** the character wears those five reliquaries

### Requirement: A trial's first clear pays its reward once

A trial's first clear SHALL give its reward, and a later clear of the same trial SHALL give none.

#### Scenario: The first clear gives the reward

- **GIVEN** a trial no clear of which is recorded
- **WHEN** the player clears the trial
- **THEN** the trial's reward is given and its claim is recorded

#### Scenario: A later clear gives no reward

- **GIVEN** a trial whose reward is already claimed
- **WHEN** the player clears the trial again
- **THEN** no reward is given
