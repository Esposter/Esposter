## Purpose

How a persona session's character is picked: the nearest birthday by default, a typed lore pick when a key is set, and the session record that keeps the pick for the rest of the session.

## Requirements

### Requirement: Nearest birthday picks the character

The session character SHALL be the roster character whose birthday is nearest to today when neither a pin, a recorded pick nor a lore pick decides it.

#### Scenario: Session starts with no pin and no lore key

- **GIVEN** no pin names a roster character and no typed-decision key is set
- **WHEN** a session starts
- **THEN** the character whose birthday is nearest to today is given
- **AND** the card notes that birthday beside the name, relative to today

#### Scenario: Two characters share the nearest birthday

- **GIVEN** two characters are equally near to today
- **WHEN** a session starts with no pin and no lore key
- **THEN** the character whose birthday is still to come is given

### Requirement: Birthday pick depends on the date alone

The birthday pick SHALL depend only on the date, so every session started on one day receives the same character.

#### Scenario: Two sessions start on the same day

- **GIVEN** no pin is set and no typed-decision key is set
- **WHEN** two sessions start on the same day
- **THEN** both sessions are given the same character

### Requirement: Lore pick draws from the tier's odds

When a typed-decision key is set, the session character SHALL be one random draw weighted by the odds the typed-decision tier returns over the whole roster, and not its top choice.

#### Scenario: Lore pick answered with a roster name

- **GIVEN** a typed-decision key is set
- **WHEN** a session starts and the tier answers with a roster character
- **THEN** the character drawn from the answered odds is given and recorded for the session

#### Scenario: Lore pick unavailable falls back to the birthday pick

- **GIVEN** a typed-decision key is set
- **WHEN** a session starts and the tier times out, gives no answer or names a character the roster does not hold
- **THEN** the birthday pick stands in for that session
- **AND** the welcome states the reason beside the birthday pick

### Requirement: Lore pick is asked afresh at each session start

The typed-decision tier SHALL be asked again at every session start rather than once a day.

#### Scenario: Two sessions on one day ask the tier separately

- **GIVEN** a typed-decision key is set
- **WHEN** two sessions start on the same day
- **THEN** the tier is asked once for each session

### Requirement: Welcome shows the lore pick's odds

The welcome SHALL show the lore pick's odds as a bar chart of the drawn character and its nearest runners-up.

#### Scenario: Lore pick answered

- **GIVEN** the tier has answered with odds over the roster
- **WHEN** the welcome is printed
- **THEN** one row per shown character gives a bar, its probability and its name
- **AND** the bars are scaled to the longest of them

### Requirement: Session keeps its character across restarts

A session's character, once recorded against its session identifier, SHALL stay the same for every later start that keeps that identifier.

#### Scenario: Compaction after midnight keeps the character

- **GIVEN** a session was given a character before midnight
- **WHEN** the session is compacted or resumed after midnight
- **THEN** the same character is given

#### Scenario: A pin set mid-session leaves the character alone

- **GIVEN** a session started before a pin was set
- **WHEN** the session restarts under its identifier
- **THEN** its recorded character is unchanged

#### Scenario: A cleared session gets a fresh pick

- **GIVEN** a session has a recorded character
- **WHEN** the session is cleared, which gives it a new session identifier
- **THEN** a fresh pick is made for it

### Requirement: Character without a birthday is only pinned

A roster character with no birthday SHALL be given only by a pin and never by distance.

#### Scenario: Birthday pick skips a character with no birthday

- **GIVEN** a roster character has no birthday and no pin names it
- **WHEN** a session starts with no pin
- **THEN** the birthday pick never gives that character

### Requirement: Stale pin is ignored

A pin naming a character the roster does not hold SHALL be ignored, leaving the pick in place.

#### Scenario: Pin names a character outside the roster

- **GIVEN** the pin names a character the roster does not hold
- **WHEN** a session starts
- **THEN** the pin is ignored and the pick stands
- **AND** the today command reports the stale pin

### Requirement: Session start is never blocked by the pick

The session start SHALL NOT fail because of the character pick, and a failure SHALL leave the session with no character rather than an error card.

#### Scenario: Workspace not yet installed

- **GIVEN** the plugin's workspace is not installed
- **WHEN** a session starts
- **THEN** the session starts with no character and prints nothing from the pick
- **AND** the output style answers plainly
