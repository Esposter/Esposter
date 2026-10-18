## ADDED Requirements

### Requirement: The game day starts at the daily reset

The investigation count SHALL be the one kept from the game's daily reset at four in the morning in the game's time zone.

#### Scenario: Investigations before the reset do not count toward the new day

- **GIVEN** investigations were made before the daily reset
- **WHEN** the game day begins at the reset
- **THEN** the count the cap compares is taken from the reset onward
