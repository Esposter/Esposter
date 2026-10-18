## Purpose

Every character is read in a clone of their own voice, conditioned on one line of their own performance fetched from the community wiki — the line the reference selection measured as most typically them, or the one a card names where an ear overruled it — in whichever dub the person set up, with no clip ever committed.

## Requirements

### Requirement: Each character is spoken in a clone of their own voice

Each character's lines SHALL be spoken in a clone of their own voice, conditioned on one line of their own performance.

#### Scenario: A character with a measured reference line

- **GIVEN** a character with a measured reference line
- **WHEN** their reply is spoken
- **THEN** the voice is cloned from that line

#### Scenario: A character with no measured line

- **GIVEN** a character the measurement has not reached
- **WHEN** their reply is spoken
- **THEN** the voice is cloned from the longest story line the wiki lists for them

### Requirement: A card's named line overrides the measured line

A character's card naming a reference line SHALL take precedence over the measured line, and removing it SHALL restore the measured line.

#### Scenario: A card naming a reference

- **GIVEN** a card that names a reference line
- **WHEN** the character is spoken
- **THEN** the voice is cloned from the card's named line

#### Scenario: A card with no named reference

- **GIVEN** a card naming no reference
- **WHEN** the character is spoken
- **THEN** the voice is cloned from the measured line

### Requirement: The reference clip follows the dub the person set up

The reference clip SHALL be fetched in the dub the person set up, and switching dubs SHALL use the same line in the other performance.

#### Scenario: Switching the dub

- **GIVEN** a character whose reference line is already measured
- **WHEN** the person switches dub
- **THEN** the same line is fetched in the other performance without a new measurement

### Requirement: A reference clip is fetched on first use and kept on this machine

A reference clip SHALL be fetched on first use and kept on this machine, and a later use SHALL read it from there.

#### Scenario: Speaking a character for the first time

- **GIVEN** a reference clip not yet on this machine
- **WHEN** the character is first spoken
- **THEN** the clip is fetched and kept

#### Scenario: Speaking the same character again

- **GIVEN** a reference clip already kept on this machine
- **WHEN** the character is spoken again
- **THEN** the clip is read from the local copy

### Requirement: No reference clip is committed to the product

No reference clip SHALL be committed to the product, which SHALL carry only each line's title and a number.

#### Scenario: Inspecting the shipped product

- **GIVEN** the product as shipped
- **WHEN** its contents are inspected
- **THEN** no clip audio is included, only line titles and numbers

### Requirement: A reference is trimmed to a few seconds from its opening

Each reference clip SHALL be trimmed to a few seconds read from its opening.

#### Scenario: A story line a minute long

- **GIVEN** a story line a minute long
- **WHEN** it is used as a reference
- **THEN** only a few seconds from its opening are used

### Requirement: A twin's reference is their own opening turn

A player twin's reference SHALL be read from the twin's own opening turn, cut before their companion's cue.

#### Scenario: Speaking a player twin

- **GIVEN** a player twin whose lines are a dialogue with a companion
- **WHEN** the twin is spoken
- **THEN** the reference is cut at the first pause long enough to be the companion's cue

### Requirement: The likeness number is compared only against the same character's later runs

The likeness beside each line SHALL be compared only with the same character's own later runs, not with another character's.

#### Scenario: Comparing likeness across characters

- **GIVEN** the likeness numbers of two characters
- **WHEN** they are compared
- **THEN** they are compared only against each character's own later run
