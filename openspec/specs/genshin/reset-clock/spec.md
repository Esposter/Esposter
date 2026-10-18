# genshin/reset-clock Specification

## Purpose

The world's one reset clock: the server's 04:00 in UTC+8, on which every daily, weekly and monthly reset is read, and the game day counted from the daily reset. Pure functions over a moment, in genshin-world's services/time.

## Requirements

### Requirement: The world reads every reset on the server's clock

The world SHALL read every daily, weekly and monthly reset at 04:00 in Asia/Shanghai, whatever time zone the reader keeps.

#### Scenario: a reader in another zone sees the daily reset at the server's 04:00

- **GIVEN** a reader whose device keeps New York time
- **WHEN** the last daily reset is worked out for a moment
- **THEN** the reset is at 04:00 on the server's clock
- **AND** the reader sees that reset on the day before the server's date

### Requirement: The game day turns at the daily reset

The game day SHALL turn at the daily reset, so a moment before 04:00 on the server's clock belongs to the day before.

#### Scenario: a moment after the day's 04:00 reset belongs to that day

- **GIVEN** a moment after the day's 04:00 reset on the server's clock
- **WHEN** the game day is worked out
- **THEN** the moment belongs to that day

#### Scenario: the instant just before 04:00 still belongs to the previous day

- **GIVEN** the instant just before 04:00 on the server's clock
- **WHEN** the game day is worked out
- **THEN** the moment belongs to the previous day

### Requirement: The last daily reset is the 04:00 at or before a moment

The last daily reset SHALL be the 04:00 on the server's clock at or before the moment read.

#### Scenario: the instant just before 04:00 belongs to the previous day

- **GIVEN** the instant just before 04:00 on the server's clock
- **WHEN** the last daily reset is worked out
- **THEN** the last reset is the 04:00 of the day before

#### Scenario: a moment at or after 04:00 has that day's reset as its last

- **GIVEN** a moment at or after 04:00 on the server's clock
- **WHEN** the last daily reset is worked out
- **THEN** the last reset is that day's 04:00

### Requirement: The next daily reset is the 04:00 a day after the last

The next daily reset SHALL be the 04:00 a day after the last daily reset.

#### Scenario: the next daily reset is the 04:00 a day after the last one

- **GIVEN** a moment on the server's clock
- **WHEN** the next daily reset is worked out
- **THEN** the next reset is the 04:00 a day after the last one

#### Scenario: a moment at the reset itself counts the next day's reset, not that one

- **GIVEN** a moment at the 04:00 reset itself
- **WHEN** the next daily reset is worked out
- **THEN** the next reset is the 04:00 a day after that one

### Requirement: The week resets on Monday at 04:00 on the server's clock

The week SHALL begin at the Monday 04:00 on the server's clock at or before the moment read.

#### Scenario: the weekly reset falls on Monday's 04:00

- **GIVEN** the moment is a Monday at 04:00 on the server's clock
- **WHEN** the last weekly reset is worked out
- **THEN** the last weekly reset is that moment

#### Scenario: the instant just before Monday's 04:00 belongs to the week before

- **GIVEN** the instant just before Monday's 04:00 on the server's clock
- **WHEN** the last weekly reset is worked out
- **THEN** the last weekly reset is the Monday before

#### Scenario: a moment on Sunday belongs to the week that began the Monday before

- **GIVEN** a moment on a Sunday on the server's clock
- **WHEN** the last weekly reset is worked out
- **THEN** the last weekly reset is the Monday before that Sunday

### Requirement: The next weekly reset is the Monday 04:00 a week after

The next weekly reset SHALL be the Monday 04:00 seven days after the last weekly reset.

#### Scenario: the next weekly reset is the Monday 04:00 after the week's reset

- **GIVEN** a moment on the server's clock
- **WHEN** the next weekly reset is worked out
- **THEN** the next reset is the Monday 04:00 seven days after the last weekly reset

#### Scenario: a moment at the reset itself counts the following week's reset, not that one

- **GIVEN** a moment at a Monday's 04:00 reset itself
- **WHEN** the next weekly reset is worked out
- **THEN** the next reset is the Monday 04:00 seven days after that one

### Requirement: The month resets on the first at 04:00 on the server's clock

The month SHALL begin at the first of the month's 04:00 on the server's clock at or before the moment read.

#### Scenario: the monthly reset falls on the first at 04:00

- **GIVEN** the moment is the first of a month at 04:00 on the server's clock
- **WHEN** the last monthly reset is worked out
- **THEN** the last monthly reset is that moment

#### Scenario: the instant just before the first's 04:00 belongs to the month before

- **GIVEN** the instant just before the first's 04:00 on the server's clock
- **WHEN** the last monthly reset is worked out
- **THEN** the last monthly reset is the first of the month before

### Requirement: The next monthly reset is the first of the next month at 04:00

The next monthly reset SHALL be the first of the following month at 04:00 on the server's clock.

#### Scenario: the next monthly reset is the first of the next month at 04:00

- **GIVEN** a moment on the server's clock
- **WHEN** the next monthly reset is worked out
- **THEN** the next reset is the first of the next month at 04:00

#### Scenario: a moment at the reset itself counts the following month's reset, not that one

- **GIVEN** a moment at a first's 04:00 reset itself
- **WHEN** the next monthly reset is worked out
- **THEN** the next reset is the first of the month after that one at 04:00
