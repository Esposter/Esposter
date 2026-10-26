## Purpose

Each character's Friendship Level read from the Companionship EXP it has earned, the game's own level table (`~/Esposter/genshin-parity/text/ExcelBinOutput/AvatarFettersLevelExcelConfigData.json`), and the Original Resin claims giving that EXP to the deployed team but the Traveler, with the Serenitea Pot dialogue and the namecard's art and description still unopened.

## Requirements

### Requirement: Each character's Friendship Level

Each character's Friendship Level SHALL be the number of the game's levels its total Companionship EXP has reached (`~/Esposter/genshin-parity/text/ExcelBinOutput/AvatarFettersLevelExcelConfigData.json`).

#### Scenario: A total of 1,000 EXP reaches level 2

- **GIVEN** a character has 1,000 total Companionship EXP
- **WHEN** its Friendship Level is read
- **THEN** the level is 2 (`~/Esposter/genshin-parity/text/ExcelBinOutput/AvatarFettersLevelExcelConfigData.json`)

#### Scenario: A total below the first level's total is level 1

- **GIVEN** a character has less than 1,000 total Companionship EXP
- **WHEN** its Friendship Level is read
- **THEN** the level is 1

### Requirement: A Companionship EXP claim

A Companionship EXP claim SHALL grant its full amount to every deployed character except the Traveler.

#### Scenario: The Traveler gains nothing from a claim

- **GIVEN** the Traveler is in the deployed team
- **WHEN** a claim grants Companionship EXP
- **THEN** the Traveler gains no Companionship EXP
- **AND** every other deployed character gains the full amount

#### Scenario: A fallen member still gains the full amount

- **GIVEN** a deployed character has fallen
- **WHEN** a claim grants Companionship EXP
- **THEN** that character still gains the full amount

### Requirement: A character's total Companionship EXP

A character's total Companionship EXP SHALL stop at the top level's total.

#### Scenario: A character at the top level gains nothing more

- **GIVEN** a character is at the top Friendship Level
- **WHEN** a claim grants it Companionship EXP
- **THEN** it gains nothing

#### Scenario: A claim that would pass the top is cut short

- **GIVEN** a character is just below the top Friendship Level
- **WHEN** a claim would take its total past the top level's
- **THEN** its total stops at the top level's

### Requirement: A character

A character SHALL hold its namecard once its total reaches the level its namecard row names, which is level 10 for all but four characters (`~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/FetterCharacterCardExcelConfigData.json`).

#### Scenario: Reaching level 10 holds the namecard

- **GIVEN** a character's total reaches level 10
- **WHEN** its profile is shown
- **THEN** its namecard is held and shown by its name

#### Scenario: Below level 10 the namecard is not held

- **GIVEN** a character whose namecard row names level 10 has a total below level 10
- **WHEN** its profile is shown
- **THEN** its namecard is not held

## Open

- [ ] **The Original Resin claims give Companionship EXP to the deployed team but the Traveler** — no source yet: the cached Original Resin wiki page is not on disk.
- [ ] **A character holds its namecard once its total reaches level 10** — contradicted by ~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/FetterCharacterCardExcelConfigData.json: four characters' namecard rows name level 6 or level 1.
