## Purpose

The settings screen's runs: the follow camera's defaults.

## Requirements

### Requirement: The follow camera's two sensitivities and default distance

The follow camera's two sensitivities and default distance SHALL each equal the value the game's Controls tab shows.

#### Scenario: Defaults are written from the game's Controls tab

- **GIVEN** the Settings screen's Controls tab can be read
- **WHEN** the follow camera's defaults are read
- **THEN** each default equals the value the game shows

#### Scenario: Without a Controls tab export the defaults stay provisional

- **GIVEN** the Settings screen's Controls tab cannot be read
- **WHEN** the follow camera's defaults are considered
- **THEN** the defaults stay provisional and unwritten
