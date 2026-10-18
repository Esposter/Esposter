## ADDED Requirements

### Requirement: A spoken line shows as a bubble on the model and plays on it when a viewer is on file

The persona voice SHALL show each spoken line as a bubble on the viewer's model and SHALL play the line's sound on that model while a viewer is on file and listening.

#### Scenario: A spoken line appears on the model

- **GIVEN** a viewer is on file and listening
- **WHEN** a reply's spoken line is spoken
- **THEN** the viewer shows the line as a bubble on the model
- **AND** the line's sound plays on the model

#### Scenario: A compressed-only path keeps the sound on the stock player

- **GIVEN** a viewer is on file and listening
- **AND** the viewer's sound form needs a compressed clip
- **WHEN** a reply's spoken line is spoken
- **THEN** the viewer shows the line as a bubble on the model
- **AND** the line's sound plays on the stock player, not on the model

#### Scenario: The next line waits for the clip's own length

- **GIVEN** a reply has two spoken lines and a viewer is listening
- **WHEN** the first line's sound is playing
- **THEN** the second line begins after the first clip's length has passed

### Requirement: The stock player plays the reading when no viewer answers

The persona voice SHALL play a reading on the stock audio player when no viewer answers, and SHALL keep the reading on the player from the next line when the viewer drops during it.

#### Scenario: No viewer listening falls back to the stock player

- **GIVEN** no viewer is listening
- **WHEN** a reply is spoken
- **THEN** the reply plays whole on the stock player

#### Scenario: A viewer dropping mid-reply moves the rest to the player

- **GIVEN** a reply is playing on the viewer
- **WHEN** the viewer drops the connection
- **THEN** the lines after that point play on the stock player

### Requirement: A newer turn stops the sound and clears the bubble on the viewer

The persona voice SHALL stop the sound and clear the bubble on the viewer when a newer turn supersedes the reading.

#### Scenario: A newer turn clears the bubble

- **GIVEN** a reading is playing on the viewer
- **WHEN** a newer turn arrives
- **THEN** the sound stops
- **AND** the bubble is cleared

### Requirement: Attention and the end of a turn move the character when the reader has mapped them

The persona SHALL play the motion mapped to attention wanted on the model, SHALL clear the expression when a turn ends and play the motion mapped to the end of a turn if the reader mapped one, and SHALL send no motion for a moment with no mapping.

#### Scenario: Attention wanted turns the character

- **GIVEN** a motion is mapped to attention wanted
- **WHEN** the session wants the reader's attention
- **THEN** the model plays the mapped motion

#### Scenario: An expression is cleared when a turn ends

- **GIVEN** an expression is showing on the model
- **WHEN** a turn ends
- **THEN** the expression is cleared

#### Scenario: An unmapped moment sends no motion to the viewer

- **GIVEN** no motion is mapped to the end of a turn
- **WHEN** a turn ends
- **THEN** no motion is sent to the viewer

### Requirement: A tap on the model replays the last line without synthesizing it again

The viewer's tap SHALL replay the last line the character spoke, without synthesizing that line again.

#### Scenario: A tap replays the last line

- **GIVEN** the character has spoken a line on the viewer
- **WHEN** the reader taps the model
- **THEN** that line plays again on the model

#### Scenario: A tap sends no turn to the session

- **GIVEN** the character has spoken a line on the viewer
- **WHEN** the reader taps the model
- **THEN** the session receives no new turn

### Requirement: The viewer verb sets up the viewer and teardown removes it

The reader SHALL set the viewer's address and model with one verb, see one bubble proving the connection, map motions to moments with the same verb, and remove that setup with teardown.

#### Scenario: The viewer verb proves the connection with one bubble

- **GIVEN** a viewer is running at an address
- **WHEN** the reader runs the viewer verb with that address
- **THEN** one bubble appears on the model in the interface language

#### Scenario: The viewer verb reports a viewer that did not answer

- **GIVEN** no viewer is listening at the address
- **WHEN** the reader runs the viewer verb with that address
- **THEN** the verb reports that the viewer did not answer

#### Scenario: Teardown removes the viewer setup

- **GIVEN** a viewer address is on file
- **WHEN** the reader runs teardown
- **THEN** no viewer address is on file

### Requirement: A machine with no viewer behaves as it does today

The persona SHALL speak and react as it does today when no viewer address is on file.

#### Scenario: A machine with no viewer is unchanged

- **GIVEN** no viewer address is on file
- **WHEN** a reply is spoken
- **THEN** no viewer connection is attempted
- **AND** the reply plays on the stock player as it does today
