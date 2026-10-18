## Purpose

Genshin's investigation spots as built — the daily cap of a hundred investigations, after which no more spawn, read as a pure, tested rule. The spots, their places and the artifacts, ingredients, ores or Mora they give are the proposal's still.

## Requirements

### Requirement: Investigation spots stop spawning at a daily cap of one hundred

Investigation spots SHALL keep spawning only while fewer than one hundred investigations have been made in the game day, and SHALL spawn no more once the cap is reached.

#### Scenario: Spots spawn below the cap

- **GIVEN** fewer than one hundred investigations have been made in the game day
- **WHEN** the spawn rule is checked
- **THEN** more spots spawn

#### Scenario: No spot spawns at the cap

- **GIVEN** one hundred investigations have been made in the game day
- **WHEN** the spawn rule is checked
- **THEN** no more spots spawn

### Requirement: The game day starts at the daily reset

The investigation count SHALL be the one kept from the game's daily reset at four in the morning in the game's time zone.

#### Scenario: Investigations before the reset do not count toward the new day

- **GIVEN** investigations were made before the daily reset
- **WHEN** the game day begins at the reset
- **THEN** the count the cap compares is taken from the reset onward
