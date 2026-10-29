## ADDED Requirements

### Requirement: The publish writes an index of every pack

The publish SHALL write one hosted game data record that lists, for each published avatar, its name and each of its files with the file's path, bytes and sha256.

#### Scenario: Index lists each avatar's files

- **GIVEN** the packs' folder holds two avatars with their files
- **WHEN** the packs are published
- **THEN** the index holds both avatars, each with its files' paths, bytes and sha256

#### Scenario: Dry run reports the index and writes nothing

- **GIVEN** the dry-run switch is set
- **WHEN** the publish runs
- **THEN** the index's avatar count and total bytes are reported
- **AND** no account is written

### Requirement: The opening downloads every published pack the browser lacks

The opening SHALL, when it mounts, plan the download from the index against the files the browser already keeps and SHALL fetch only the files it lacks.

#### Scenario: First visit downloads every file

- **GIVEN** the browser keeps no pack file
- **WHEN** the opening mounts
- **THEN** every file in the index is fetched and kept

#### Scenario: Returning visit downloads nothing

- **GIVEN** the browser keeps every file in the index
- **WHEN** the opening mounts
- **THEN** no pack file is fetched

#### Scenario: Republished file is fetched again

- **GIVEN** the browser keeps a file and the index now lists that file with a different sha256
- **WHEN** the opening mounts
- **THEN** that file is fetched and the older copy is no longer read

### Requirement: The startup loading screen shows the download

The startup loading screen SHALL show the bytes downloaded and the bytes to download in the reader's language, and its bar SHALL move with the bytes while any are pending.

#### Scenario: Size shows beside the bar while bytes are pending

- **GIVEN** files remain to download
- **WHEN** the startup loading screen is shown
- **THEN** the game's downloading line and the bytes loaded over the bytes to load are shown in the reader's language
- **AND** the bar's first share advances with the bytes loaded

#### Scenario: Nothing pending shows no size

- **GIVEN** the browser keeps every file
- **WHEN** the startup loading screen is shown
- **THEN** no size is shown
- **AND** the bar follows the world's own steps alone

### Requirement: A failed download stops the loading and can be retried

A pack file SHALL be attempted three times, and when the third fails the loading SHALL stop with the game's failure line and a retry that fetches only the files not yet kept.

#### Scenario: Retry fetches only what is missing

- **GIVEN** a file failed all three attempts and the others were kept
- **WHEN** the player retries
- **THEN** only the failed file and any not yet kept are fetched

#### Scenario: Failure never enters the world without the model

- **GIVEN** a file failed all three attempts
- **WHEN** the loading stops
- **THEN** the failure line is shown
- **AND** the world is not shown until the download completes
