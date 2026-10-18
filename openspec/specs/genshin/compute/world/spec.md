## Purpose

The world's own runs: the thunderstorm's frames, the teleport's fades, the weather's turn and lightning, the props scripts spawn and the HUD.

## Requirements

### Requirement: Each world run names its input and its bar

Each world run SHALL name the recording or game data it reads and the bar it must meet before it is done.

#### Scenario: A queued run is listed with its input and bar

- **GIVEN** a world run is queued on the roadmap
- **WHEN** its entry is read
- **THEN** it names the recording or data it reads
- **AND** it names the bar its output must meet

#### Scenario: A run whose input does not exist yet is blocked

- **GIVEN** a world run whose input has not been recorded or decoded
- **WHEN** the roadmap is read
- **THEN** the run is marked blocked
- **AND** its entry names the missing input

### Requirement: Run output stays outside the repository

The output of a world run SHALL be written outside the repository.

#### Scenario: A frame run completes

- **GIVEN** the thunderstorm recording and the frame command
- **WHEN** the run finishes
- **THEN** its stills and contact sheet are written to the local parity folder
- **AND** no output is added to the repository

### Requirement: Reference sources record where and when they were found

Each reference SHALL record its origin and the date it was found or searched for.

#### Scenario: A reference found on a video site records its link and time range

- **GIVEN** a clip found on a public video site
- **WHEN** the reference is recorded
- **THEN** the entry gives the link and the time range used
- **AND** the entry gives the date it was found

#### Scenario: A reference no source holds is recorded as not found

- **GIVEN** a search of the wiki and the video sites that finds nothing
- **WHEN** the reference is recorded
- **THEN** the entry says none was found
- **AND** the entry gives the date it was searched
