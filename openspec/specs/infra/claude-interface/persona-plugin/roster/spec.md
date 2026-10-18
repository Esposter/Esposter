## Purpose

The game-data dependency every persona character is read from, and the cache that keeps each read to one per installed version of it.

## Requirements

### Requirement: Roster holds every playable character

The roster SHALL hold every playable character the game-data dependency ships, including characters that have no card.

#### Scenario: Character with no card

- **GIVEN** a playable character has no card
- **WHEN** the roster is read
- **THEN** the character is available to be picked
- **AND** its game data alone is enough for it to speak

### Requirement: Roster follows the dependency with no generation step

The roster SHALL follow each version of the game-data dependency without any generation step, and a new version SHALL invalidate the cache by itself.

#### Scenario: Dependency bumped to a new version

- **GIVEN** the cached roster was read from an earlier version of the dependency
- **WHEN** a session starts on the new version
- **THEN** the roster is read again from the new version
- **AND** the copies cached for other versions are removed

### Requirement: Roster is read once per version and language

The roster SHALL be read from the game data at most once for each installed version of the dependency and each interface language.

#### Scenario: Warm start uses the cache

- **GIVEN** the roster is cached for the installed version and the interface language
- **WHEN** a session starts
- **THEN** the game data is not loaded again

#### Scenario: Language change is a cache miss

- **GIVEN** the roster is cached for the current interface language
- **WHEN** the interface language is changed
- **THEN** the roster is read again in the new language

### Requirement: Missing game data falls back to the fallback card

A missing install of the game-data dependency SHALL fall back to the fallback card rather than failing the session.

#### Scenario: Dependency not installed

- **GIVEN** the game-data dependency is not installed
- **WHEN** a session starts
- **THEN** the session shows the fallback card
- **AND** the session is not blocked
