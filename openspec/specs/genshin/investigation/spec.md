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
