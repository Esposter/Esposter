## Purpose

One repo script that, for every roster character, fetches their story lines from the community wiki, chooses the line that best represents their voice, clones a carrier sentence from it through the plugin's own engine, scores the clone, and generates the roster's choices as one map the plugin reads — plus a check that every chosen line is still a file in every dub. No clip is written anywhere, and the ear keeps the last word.

## Requirements

### Requirement: Measurement runs in one dub and writes only when asked

The voice measurement SHALL measure the roster in one chosen dub, or only the characters named, and SHALL write its map only when the write option is given.

#### Scenario: Dry measurement

- **GIVEN** a measurement is run without the write option
- **WHEN** the run finishes
- **THEN** each character's stem and likeness are printed
- **AND** no map is written

#### Scenario: Measurement with the write option

- **GIVEN** a measurement is run with the write option
- **WHEN** the run finishes
- **THEN** the map is generated from the measured characters

### Requirement: A named run keeps the other entries

A run that names characters SHALL write only their entries and SHALL keep every other entry already in the map.

#### Scenario: Named characters re-measured

- **GIVEN** the map already holds entries for other characters
- **WHEN** a run names one character and writes the map
- **THEN** the named character's entry is replaced
- **AND** every other entry is kept

### Requirement: Reference is the clip nearest the character's voice

Each character's reference SHALL be the clip nearest the centre of that character's voice among clips with enough clean speech.

#### Scenario: Character with too few usable clips

- **GIVEN** a character has fewer than a handful of usable clips
- **WHEN** the measurement runs
- **THEN** the character is reported rather than profiled
- **AND** it is left out of the map

### Requirement: Likeness uses one encoder, carrier and trim for all characters

Every character's likeness SHALL be measured with the same encoder, the same carrier sentence and the same trim, so that the numbers compare across the roster.

#### Scenario: Likeness scored for each character

- **GIVEN** a character's reference has been chosen
- **WHEN** its likeness is measured
- **THEN** the carrier sentence is synthesized from the reference with the shared settings
- **AND** its likeness is the score against the character's voice centre

### Requirement: Check fails when a chosen line is no longer in every dub

The check SHALL fail and exit with a failure status when the line any character is read from is missing from any dub.

#### Scenario: Line renamed on the wiki

- **GIVEN** a character's chosen line has been renamed on the wiki in one dub
- **WHEN** the check runs
- **THEN** the check lists the missing line
- **AND** the check exits with a failure status

#### Scenario: Every line present in every dub

- **GIVEN** every character's chosen line exists in every dub
- **WHEN** the check runs
- **THEN** the check exits with a success status

### Requirement: No decoded clip is kept

The measurement SHALL keep no decoded clip in the repository or beside it, and the map SHALL hold only titles and numbers.

#### Scenario: Run finishes

- **GIVEN** a measurement has run
- **WHEN** it finishes
- **THEN** the only file it writes is the map of titles and numbers

### Requirement: Character with no voice-over page is left out

A character the wiki has no voice-over page for SHALL be reported and left out of the map.

#### Scenario: Character with no voice-over page

- **GIVEN** the wiki has no voice-over page for a character
- **WHEN** the measurement runs
- **THEN** the character is reported
- **AND** it has no entry in the map
