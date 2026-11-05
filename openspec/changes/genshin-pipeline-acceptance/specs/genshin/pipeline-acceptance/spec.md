## ADDED Requirements

### Requirement: A Mac decoder is accepted only at the Windows counts

The macOS AnimeStudio build SHALL be accepted only when its file count for each reference block equals the count committed beside the build for the Windows build.

#### Scenario: A Mac build whose counts differ from the Windows counts is refused

- **GIVEN** a Mac build whose count for a reference block differs from the committed count
- **WHEN** the build's parity check runs
- **THEN** the build publishes nothing and names the block

#### Scenario: The Windows counts are committed beside the build

- **GIVEN** the repository
- **WHEN** the counts file is read
- **THEN** it names every reference block with the count the Windows build gave

### Requirement: The game-running guard reads the process list on macOS

The game-running guard SHALL refuse a block run while the game is running on macOS, as it does on Windows.

#### Scenario: A block run refuses while the game is running on macOS

- **GIVEN** the game process is running on macOS
- **WHEN** a block run starts
- **THEN** the run stops and names the game

#### Scenario: A block run proceeds when the game is not running on macOS

- **GIVEN** no game process is running on macOS
- **WHEN** a block run starts
- **THEN** the run proceeds

### Requirement: A measured value names its capture

Every hand-set fit constant and every value measured from a capture SHALL be written in a measurement file that names the capture and the frame it was read from.

#### Scenario: A measured value names the capture it was read from

- **GIVEN** a measurement file
- **WHEN** its entries are read
- **THEN** each entry names a capture and a frame

#### Scenario: A measurement entry with no capture is refused

- **GIVEN** a measurement entry that names no capture
- **WHEN** the file is read
- **THEN** the read is refused and names the entry

### Requirement: A fresh pair publishes the same lock from one install

A fresh PC and Mac pair, each holding the install, SHALL publish the same lock from the same install.

#### Scenario: A fresh pair publishes the same lock from one install

- **GIVEN** a fresh checkout on the PC and a fresh checkout on the Mac, each holding the install
- **WHEN** each runs the pipeline to its publish
- **THEN** the two generated locks are the same file
