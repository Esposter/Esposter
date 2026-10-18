## Purpose

The game's domains' opening rules as pure checks. A kind opens at its Adventure Rank, Forgery at 16, Blessing at 22 and Mastery at 27, as the wiki gives them. A Domain of Forgery or Mastery is open every Sunday and on the two days its table sets, a Domain of Blessing every day. Entrances, levels and challenges wait on the proposal.

## Requirements

### Requirement: Each domain kind opens at its Adventure Rank

A domain kind SHALL be open once the player's Adventure Rank reaches its rank: Forgery at 16, Blessing at 22 and Mastery at 27.

#### Scenario: A kind opens at its rank

- **GIVEN** an Adventure Rank of 16
- **WHEN** a Domain of Forgery is checked
- **THEN** it is open

#### Scenario: A kind stays closed below its rank

- **GIVEN** an Adventure Rank of 26
- **WHEN** a Domain of Mastery is checked
- **THEN** it is closed

### Requirement: A Domain of Blessing opens every day

A Domain of Blessing SHALL be open on every game day once its rank is reached.

#### Scenario: A Domain of Blessing is open on any weekday

- **GIVEN** an Adventure Rank that reaches the Domain of Blessing's rank
- **WHEN** it is checked on any weekday
- **THEN** it is open

### Requirement: A Domain of Forgery or Mastery opens on Sundays and its two set days

A Domain of Forgery or Mastery SHALL be open on Sundays and on the two weekdays its table sets for it, and closed on other days.

#### Scenario: A Sunday opens a Domain of Forgery

- **GIVEN** a Sunday
- **WHEN** a Domain of Forgery is checked
- **THEN** it is open

#### Scenario: One of the table's two days opens a Domain of Mastery

- **GIVEN** a weekday the table sets for a Domain of Mastery
- **WHEN** it is checked
- **THEN** the Domain of Mastery is open

#### Scenario: Another weekday leaves the domain closed

- **GIVEN** a weekday that is neither a Sunday nor one of the table's two days
- **WHEN** a Domain of Mastery is checked
- **THEN** it is closed

### Requirement: The game's day turns at 04:00 in UTC+8, and Forgery's day turns at the reset

The game's day SHALL turn at 04:00 in UTC+8, and a Domain of Forgery's day SHALL turn at that reset rather than at midnight.

#### Scenario: The day has not yet turned at 03:59

- **GIVEN** the time 03:59 in UTC+8
- **WHEN** the game's day is read
- **THEN** it is still the previous day

#### Scenario: The day turns at 04:00

- **GIVEN** the time 04:00 in UTC+8
- **WHEN** the game's day is read
- **THEN** it is the new day
