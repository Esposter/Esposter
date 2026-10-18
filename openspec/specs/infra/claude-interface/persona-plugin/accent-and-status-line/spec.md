## Purpose

The character's colour, drawn as the genshin mods' accent, and the status line a person names in their settings to show the session's nameplate on a tonal badge.

## Requirements

### Requirement: The session's accent is the character's colour

A session with a known character SHALL show that character's colour as the accent, and the element's colour SHALL stand in for a character with no colour of their own.

#### Scenario: A character with a colour of their own

- **GIVEN** a session whose character has a colour of their own
- **WHEN** the accent is drawn
- **THEN** it shows the character's colour

#### Scenario: A character with no colour of their own

- **GIVEN** a session whose character has no colour of their own
- **WHEN** the accent is drawn
- **THEN** it shows the element's colour

### Requirement: A colour unreadable on the dark background is lightened

Where a character's colour fails contrast on the dark background, it SHALL be lightened until it passes, keeping its hue.

#### Scenario: A deep red on the dark background

- **GIVEN** a deep red colour failing contrast on the dark background
- **WHEN** it is drawn
- **THEN** it is lightened until it passes while keeping its red hue

### Requirement: A status line shows the nameplate in the character's colour

A status line the person names in their settings SHALL show the session's character name on a badge in the character's colour.

#### Scenario: The status line for a session with a character

- **GIVEN** a status line naming the plugin's script and a session with a character
- **WHEN** the status line is drawn
- **THEN** the name shows on a badge in the character's colour with a readable label

#### Scenario: A character with neither colour nor element

- **GIVEN** a session whose character has no colour and no element
- **WHEN** the status line is drawn
- **THEN** the name is shown plain

### Requirement: The repository's status line works from any folder of the checkout

The repository's checked-in settings SHALL name the status line so that a session started in any folder of the checkout finds it.

#### Scenario: A session started in a subfolder or a worktree

- **GIVEN** a session started in a subfolder or a worktree of the checkout
- **WHEN** the status line runs
- **THEN** it finds the plugin's script and shows the nameplate

### Requirement: A person's own status line takes precedence

A status line a person keeps in their local settings SHALL take precedence over the checked-in one.

#### Scenario: A person with their own status line

- **GIVEN** a person whose local settings name their own status line
- **WHEN** a session runs
- **THEN** their own status line is used
