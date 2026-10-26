## Purpose

Where a parity screen's reference images and recordings come from, how the installed game is recorded without being driven, and the capture pinned to its window.

## Requirements

### Requirement: Reference images are kept outside the repository

Reference images SHALL be kept outside the repository, which SHALL hold only the reference each screen is judged against, named by its wiki file or by the recording and the second it is taken at.

#### Scenario: Reference fetched

- **GIVEN** a reference a screen is judged against
- **WHEN** the reference is fetched or recorded
- **THEN** its images are kept outside the repository
- **AND** the repository names only the wiki file, or the recording and the second, that the reference comes from

### Requirement: Published sources are searched before the game is recorded

A reference SHALL come from published sources wherever the wiki, the community's data or public videos already show it, and the installed game SHALL be recorded only for what none of them shows.

#### Scenario: Screen already published

- **GIVEN** a screen whose look the wiki shows
- **WHEN** its reference is sought
- **THEN** the wiki's screenshot is used before any recording is made

#### Scenario: Only the game shows it

- **GIVEN** a detail that no published source shows
- **WHEN** its reference is sought
- **THEN** a best estimate is marked provisional until the game is recorded

### Requirement: The installed game is recorded without any input sent to it

A recording of the installed game SHALL send the game no input, the player playing while the recording runs.

#### Scenario: Recording runs during play

- **GIVEN** the player is playing the installed game
- **WHEN** a recording runs
- **THEN** no input is sent to the game

### Requirement: A recording contains only the game's own window

A recording SHALL contain only the game's own window, so that no other window, the desktop, the cursor or an overlay reaches the file.

#### Scenario: Player switches to another window

- **GIVEN** a recording of the game is running
- **WHEN** the player switches to another application
- **THEN** that application's content does not reach the recording

### Requirement: An armed recording waits for the game's window

A recording armed before the game starts SHALL wait for the game's window to open and SHALL take it from its first frame.

#### Scenario: Recording armed before launch

- **GIVEN** a recording is armed before the game starts
- **WHEN** the game's window opens
- **THEN** the recording starts with the window's first frame

### Requirement: A recording is encoded at full frame rate and stays readable if cut short

A recording SHALL be encoded at 60 frames a second, near-lossless, in a container that stays readable if the recording is cut short.

#### Scenario: Recording cut short

- **GIVEN** a recording is stopped before its planned end
- **WHEN** the file is read
- **THEN** the frames written so far are readable

### Requirement: A minimised game ends a recording by the clock

A recording SHALL end at its length in real time when the game is minimised and gives no frames.

#### Scenario: Game minimised during recording

- **GIVEN** a recording of the game is running
- **WHEN** the game is minimised and gives no frames
- **THEN** the recording ends at its length in real time

### Requirement: The encoder is refused unless it matches its pinned checksum

The encoder SHALL be fetched as one pinned release, and SHALL be refused when the fetched release does not match its pinned checksum.

#### Scenario: Fetched encoder matches the pin

- **GIVEN** the encoder is needed for the first time
- **WHEN** the pinned release is fetched and its checksum matches
- **THEN** the encoder is unpacked into the shared tool cache

#### Scenario: Fetched encoder does not match the pin

- **GIVEN** the encoder is needed for the first time
- **WHEN** the fetched release does not match its pinned checksum
- **THEN** the encoder is refused
