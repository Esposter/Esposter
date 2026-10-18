## MODIFIED Requirements

### Requirement: The weekly reset falls on Monday at 04:00

The weekly reset SHALL fall on Monday at 04:00 on the server's clock.

#### Scenario: Moment before the reset belongs to the week before

- **GIVEN** a moment just before Monday 04:00 on the server's clock
- **WHEN** the week is worked out
- **THEN** the moment belongs to the week before

#### Scenario: Moment at or after the reset belongs to the new week

- **GIVEN** a moment at or after Monday 04:00 on the server's clock
- **WHEN** the week is worked out
- **THEN** the moment belongs to the new week
