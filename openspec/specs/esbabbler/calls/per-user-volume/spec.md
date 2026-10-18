## Purpose

Per-remote-participant volume slider in the active call — a client-only multiplier on top of the master speaker volume.

## Requirements

### Requirement: A User Volume slider adjusts one participant's audio for the reader

The participant action menu SHALL offer a User Volume slider from 0 to 200 percent that adjusts only that participant's audio on the reader's own device.

#### Scenario: Lowering one participant's volume

- **GIVEN** the reader is in a call with a participant named Sam
- **WHEN** the reader sets Sam's User Volume to 50 percent
- **THEN** Sam is heard at half volume by the reader
- **AND** every other participant is heard at their usual volume

#### Scenario: Raising a participant's volume above the default

- **GIVEN** the master speaker volume is at 100 percent
- **WHEN** the reader sets a participant's User Volume to 200 percent
- **THEN** that participant is heard no louder than at 100 percent

### Requirement: A participant's volume is combined with the master speaker volume

The volume applied to a participant SHALL be the master speaker volume multiplied by that participant's User Volume, capped at full volume.

#### Scenario: Both settings reduce the volume

- **GIVEN** the master speaker volume is at 50 percent
- **WHEN** a participant's User Volume is at 50 percent
- **THEN** that participant is heard at 25 percent of full volume

#### Scenario: Participant volume cannot exceed full volume

- **GIVEN** the master speaker volume is at 50 percent
- **WHEN** a participant's User Volume is at 200 percent
- **THEN** that participant is heard at full volume

### Requirement: A participant's volume starts at 100 percent and resets when they leave

A participant's User Volume SHALL start at 100 percent and SHALL return to 100 percent when that participant leaves the call.

#### Scenario: Volume resets after the participant leaves

- **GIVEN** the reader has set a participant's User Volume to 50 percent
- **WHEN** that participant leaves the call
- **THEN** their User Volume is back at 100 percent when they rejoin

#### Scenario: Volume resets when the call ends

- **GIVEN** the reader has changed a participant's User Volume during a call
- **WHEN** the reader leaves the call
- **THEN** a later call with the same participant starts at 100 percent

### Requirement: User Volume is local and never saved or shared

A participant's User Volume SHALL affect only the reader's own device and SHALL NOT be saved or shared with anyone.

#### Scenario: Other participants are not told about a change

- **GIVEN** the reader changes a participant's User Volume
- **WHEN** the change is made
- **THEN** no other participant is notified of it

### Requirement: The participant action menu stays open while its slider is dragged

The participant action menu SHALL stay open while the User Volume slider is being dragged and SHALL close when a moderation action is chosen.

#### Scenario: Dragging the slider keeps the menu open

- **GIVEN** the participant action menu is open
- **WHEN** the reader drags the User Volume slider
- **THEN** the menu stays open

#### Scenario: Choosing a moderation action closes the menu

- **GIVEN** a moderator has the participant action menu open
- **WHEN** they choose a moderation action
- **THEN** the menu closes
