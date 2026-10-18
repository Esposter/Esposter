## Purpose

The persona plugin's hooks module, which the engine runs in-process to draw the spinner, the footer label and the accent, and the status script it reads the session's character through.

## Requirements

### Requirement: Surfaces come from one hooks module, not settings

The plugin's terminal surfaces SHALL be drawn by the engine from one hooks module, and no plugin surface SHALL be written into the person's settings.

#### Scenario: Installing the plugin writes no setting

- **GIVEN** the persona plugin is installed
- **WHEN** a session runs with the plugin's surfaces
- **THEN** the person's settings contain no entry for them

#### Scenario: Removing the plugin leaves nothing behind

- **GIVEN** the persona plugin has drawn surfaces in a session
- **WHEN** the plugin is removed
- **THEN** none of its surfaces outlive it

### Requirement: Character named in the footer beside other labels

The session's character SHALL be named among the dim mode labels in the prompt footer, in the interface language, and SHALL NOT be shown as a warning notice under the prompt.

#### Scenario: Another plugin's footer label is kept

- **GIVEN** another plugin has added its own footer label
- **WHEN** the prompt footer is drawn
- **THEN** both the character label and the other plugin's label appear

#### Scenario: Character is not shown as a notice

- **GIVEN** a session with a character
- **WHEN** the prompt footer is drawn
- **THEN** the character does not appear as a warning notice under the prompt

### Requirement: Character read at session start and after each verb

The module SHALL read the session's character at session start and after every verb, and SHALL read it at a turn's start only while no record of the character is settled.

#### Scenario: Settled character is not read again at a turn

- **GIVEN** the session's character has been read and settled
- **WHEN** a turn starts
- **THEN** the character is not read again

#### Scenario: Clear or resume reads the new session's pick

- **GIVEN** a session has settled its character
- **WHEN** the session is cleared or resumed under a new session identifier
- **THEN** the next turn reads the new session's character

### Requirement: Only the session's own record or the pin is shown

The module SHALL show only the current session's own record or, failing that, the pin, and SHALL NOT show another session's record.

#### Scenario: Another session's use leaves this session unchanged

- **GIVEN** another session has switched its character with the use verb
- **WHEN** this session reads its character
- **THEN** this session keeps its own character

### Requirement: Replies reach the speaker only when a voice is set up

The module SHALL hand a reply to the speaker only when a voice is set up and the session is not muted, and SHALL start no process for a reply it does not hand over.

#### Scenario: No voice set up

- **GIVEN** no voice has been set up on this machine
- **WHEN** a piece of a reply is displayed
- **THEN** no speaker process is started
- **AND** the reply is not handed over

#### Scenario: Session muted

- **GIVEN** a voice is set up and the session is muted
- **WHEN** a piece of a reply is displayed
- **THEN** the piece is not handed over

### Requirement: Status reads state files, never the game data

The status report SHALL give the session's character from the state files and the roster cache without loading the game data.

#### Scenario: Status without a record uses the birthday pick

- **GIVEN** the session has no record and no pin is set
- **WHEN** the status report runs
- **THEN** the character is the birthday pick read from the roster cache
- **AND** the report says the character is not the session's own record
