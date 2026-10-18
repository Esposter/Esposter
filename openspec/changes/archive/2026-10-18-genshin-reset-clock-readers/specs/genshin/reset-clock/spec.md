## ADDED Requirements

### Requirement: The enemies' respawn check reads the world clock

The enemies SHALL check whether a defeated camp member is back against the world clock, so a camp with an elite comes back at the server's daily reset.

#### Scenario: an elite camp's member stays down until the server's reset arrives

- **GIVEN** a camp with an elite and a member defeated after the reset on the server's clock
- **WHEN** the world clock reads one millisecond before the next daily reset
- **THEN** the member is still down

#### Scenario: an elite camp's member is back when the server's reset arrives

- **GIVEN** a camp with an elite and a member defeated after the reset on the server's clock
- **WHEN** the world clock reads the next daily reset
- **THEN** the member is back

### Requirement: A domain opens on the game day of the moment checked

A domain kind and a domain level SHALL be open or closed on the game day of the moment checked, so a moment before the daily reset takes the previous game day's opening.

#### Scenario: a moment before the reset takes the previous game day's opening

- **GIVEN** a moment one millisecond before the Tuesday reset on the server's clock
- **WHEN** a Domain of Mastery set for Tuesday and Saturday is checked
- **THEN** it is closed, because the Monday game day before the reset is not one of its days

#### Scenario: a moment at the reset takes the new game day's opening

- **GIVEN** a moment at the Tuesday reset on the server's clock
- **WHEN** a Domain of Mastery set for Tuesday and Saturday is checked
- **THEN** it is open, because Tuesday is one of its days
