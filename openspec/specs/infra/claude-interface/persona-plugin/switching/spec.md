## Purpose

How a persona session changes its character with the use, pin and unpin verbs, and how a switch reaches the session's record, the card and the spinner.

## Requirements

### Requirement: Use changes only the current session

The use verb SHALL change only the current session's character and SHALL leave the pin as it stands.

#### Scenario: Use switches this session only

- **GIVEN** a pin names one character
- **WHEN** the use verb switches this session to another character
- **THEN** this session's card shows the new character
- **AND** a later session still receives the pinned character

### Requirement: Pin changes every later session and this one

The pin verb SHALL set the character for every later session and SHALL also change the current session's character.

#### Scenario: Pin set from inside a session

- **GIVEN** a session is running
- **WHEN** the pin verb sets a character
- **THEN** the current session's character is that character
- **AND** the next session started is given that character

### Requirement: Unpin gives the session a fresh pick

The unpin verb SHALL remove the pin and SHALL give the current session a fresh pick.

#### Scenario: Unpin from inside a session

- **GIVEN** a pin is set
- **WHEN** the unpin verb runs
- **THEN** the pin is removed
- **AND** the current session is given a fresh pick

### Requirement: Earlier sessions keep their character

A session that started before a pin was set SHALL keep the character it started with.

#### Scenario: Pin set after a session started

- **GIVEN** a session started before a pin was set
- **WHEN** the pin is set
- **THEN** that session's character does not change

### Requirement: A switch shows in the spinner, hint, accent and speech

A switch SHALL show at once in the spinner, the prompt hint and the accent, and SHALL be spoken from the session's next line.

#### Scenario: Switch shown straight after the verb

- **GIVEN** a session runs a switch verb
- **WHEN** the verb's answer is returned
- **THEN** the spinner, the prompt hint and the accent show the new character
- **AND** the next spoken line is read in the new character's voice

### Requirement: The card printed by a switch is the one the model answers as

The card printed by a switch SHALL be the character the model answers as from that reply onward.

#### Scenario: Model answers after a switch

- **GIVEN** a switch verb has printed a card in the conversation
- **WHEN** the model writes its next reply
- **THEN** the reply is answered as the character on that card

### Requirement: Compact and resume restore the record

A compaction or a resume SHALL restore the character from this session's record.

#### Scenario: Resume after a switch

- **GIVEN** the session switched character with the use verb
- **WHEN** the session is compacted or resumed
- **THEN** the session's new character is restored from its record
