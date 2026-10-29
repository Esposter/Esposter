## Purpose

Where a parity screen's reference images and recordings come from, how the installed game is recorded without being driven, and the capture pinned to its window.

## Requirements

### Requirement: Reference images are committed as lossless WebP

A reference image SHALL be committed to the repository as a lossless WebP file, beside its fixture variant's snapshot when it is that variant's only whole-screen reference and flat in the references folder under its id otherwise, and its manifest row SHALL name its sha256, size, dimensions, attribution and source.

#### Scenario: Reference committed beside its snapshot

- **GIVEN** a fixture variant whose only whole-screen reference is an entry without a region
- **WHEN** the reference is packed
- **THEN** its file is `Index.reference.webp` or `Index-<variant>.reference.webp` in the fixture's folder, beside its snapshot
- **AND** its sha256 is the one its manifest row names

#### Scenario: Other reference committed flat

- **GIVEN** a reference that is a region, or one of several whole-screen references its fixture variant holds
- **WHEN** the reference is packed
- **THEN** its file is `<id>.webp` in the references folder beside the manifest

#### Scenario: Reference fetched or recorded

- **GIVEN** a reference a screen is judged against, sourced from a wiki file or a recording's frame
- **WHEN** the reference is packed
- **THEN** its manifest row names the wiki file, or the recording and the second, that the reference comes from

### Requirement: A reference is read from its committed file

A command that reads a reference SHALL read the committed file, and a reference whose file is missing SHALL stop the command with the id and the path to add.

#### Scenario: Reference read by a command

- **GIVEN** a map entry with a reference whose committed file is on disk
- **WHEN** `compare`, `verify`, `approve` or a passes command reads the reference
- **THEN** it reads the committed file, with nothing fetched

#### Scenario: Reference file missing

- **GIVEN** a map entry with a reference whose committed file is not on disk
- **WHEN** a command reads the reference
- **THEN** the command fails naming the id and the path to add
- **AND** no comparison is scored against another image

### Requirement: Committed reference files match their manifest rows

Every committed reference file SHALL be named by a map entry or a manifest plate row, SHALL hash to the sha256 its row holds, and SHALL be no larger than 7,500,000 bytes.

#### Scenario: Committed file differs from its row

- **GIVEN** a committed reference file whose bytes hash to other than its row's sha256
- **WHEN** the committed-references test runs
- **THEN** the test fails naming the reference

#### Scenario: Committed file named by nothing

- **GIVEN** a committed WebP file that no map entry or plate row names
- **WHEN** the committed-references test runs
- **THEN** the test fails naming the file

#### Scenario: Committed file over the ceiling

- **GIVEN** a committed reference file larger than 7,500,000 bytes
- **WHEN** the committed-references test runs
- **THEN** the test fails naming the file

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
