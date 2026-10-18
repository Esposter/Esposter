## Purpose

How the AnimeStudio CLI is built for macOS arm64 from its pinned sources, the edits the build applies to the clone, and the staging and acceptance that keep a failed rebuild from replacing a working CLI.

## Requirements

### Requirement: The macOS build replaces the published tool only after the parity check passes

The macOS build SHALL replace the published tool only once the staged build passes the parity check, and SHALL leave the published tool and its configured path as they were otherwise.

#### Scenario: A passing staged build replaces the published tool

- **GIVEN** the pinned sources built into a staged tool
- **WHEN** the staged tool passes the parity check
- **THEN** the staged tool replaces the published tool
- **AND** the build prints the path to set for the tool

#### Scenario: A failing staged build leaves the published tool untouched

- **GIVEN** the pinned sources built into a staged tool
- **WHEN** the staged tool fails the parity check
- **THEN** the published tool is left as it was
- **AND** the path set for the tool is unchanged

### Requirement: A rebuild keeps the existing map

A rebuild SHALL carry the published tool's existing map into the new tool, so a rebuild does not discard it.

#### Scenario: A passing rebuild keeps the map

- **GIVEN** a published tool holding a map
- **WHEN** the tool is rebuilt and passes the parity check
- **THEN** the map is carried into the new tool

### Requirement: The parity check compares file counts against the Windows build

The parity check SHALL pass only when each reference block exports the same count of files of each type as the Windows build on the same game version, with no exception logged.

#### Scenario: Every reference block matches the Windows build

- **GIVEN** the reference blocks exported once for each type
- **WHEN** the counts are compared with the Windows build's
- **THEN** each type's count matches
- **AND** no exception is logged

#### Scenario: A count that differs fails the check

- **GIVEN** a reference block whose count for some type differs from the Windows build's
- **WHEN** the counts are compared
- **THEN** the parity check fails

### Requirement: The parity check is skipped only when the game's blocks are absent

The parity check SHALL be skipped only when the game's blocks are absent, and the build SHALL say why it was skipped.

#### Scenario: A skip request without the game's blocks prints the reason

- **GIVEN** the game's blocks absent and a skip requested
- **WHEN** the build runs
- **THEN** the parity check is skipped
- **AND** the build prints why

#### Scenario: A skip request with the game's blocks present is not honoured

- **GIVEN** the game's blocks present and a skip requested
- **WHEN** the build runs
- **THEN** the parity check still runs

### Requirement: The published tool runs without a separately installed runtime

The published tool SHALL run on a machine with no separately installed runtime on its path.

#### Scenario: The published tool starts with no runtime installed

- **GIVEN** a machine with no separately installed runtime
- **WHEN** the published tool is run
- **THEN** it starts and runs

### Requirement: Windows-only steps do not run on Apple silicon

Steps that need a Windows-only or proprietary component SHALL NOT run on Apple silicon.

#### Scenario: A step needing a Windows-only component is not run

- **GIVEN** a step that needs a Windows-only or proprietary component
- **WHEN** the step is requested on Apple silicon
- **THEN** the step does not run

### Requirement: Animation clips from families whose decoder does not build are unavailable on macOS

Animation clips from a game family whose decoder does not build on macOS SHALL be unavailable there.

#### Scenario: A family whose decoder does not build yields no clips

- **GIVEN** the game's clips of a family whose decoder does not build on macOS
- **WHEN** clips are extracted on macOS
- **THEN** no clip of that family is available
