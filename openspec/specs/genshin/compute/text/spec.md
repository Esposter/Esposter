## Purpose

Every language's text map, decoded from the installed game.

## Requirements

### Requirement: Every language's text map

Every language's text map SHALL be decoded from the installed game with every chunk exported and each decoded to its last byte.

#### Scenario: A full decode exports every chunk with no replacement character

- **GIVEN** the installed game's blocks are read, with each hotfixed copy taking precedence
- **WHEN** the text maps are decoded for all fifteen languages
- **THEN** all 15,360 chunks are exported
- **AND** each decodes to its last byte with no replacement character

#### Scenario: A leftover chunk or a missing key is a miss

- **GIVEN** a decode has run
- **WHEN** a chunk is left over or a key is missing
- **THEN** the decode is counted as a miss

### Requirement: The generated game text

The generated game text SHALL differ from the community dump only where the game itself changed.

#### Scenario: The text write runs green with an empty or reworded diff

- **GIVEN** the decoded maps are written into the generated text
- **WHEN** the diff is read against the generated text already kept
- **THEN** the diff is empty or holds only reworded lines, each read against the dump's map of the same revision
