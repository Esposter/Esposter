# genshin/characters/published-packs Specification

## Purpose

The official character packs are published to the public game data container, each file under its avatar id, so a browser can read a character's model from the public container.

## Requirements

### Requirement: Each pack's files publish under its avatar id

The publish SHALL name each file of an avatar's pack by the avatar's id and the file's path inside that folder, with forward slashes whatever the platform.

#### Scenario: Nested file keeps its path

- **GIVEN** an avatar folder holds a texture under a subfolder
- **WHEN** the packs are read
- **THEN** the texture is named by the avatar's id and its path inside the folder

#### Scenario: File outside an avatar folder is not published

- **GIVEN** a file sits directly in the packs' folder
- **WHEN** the packs are read
- **THEN** that file is not published

### Requirement: A publish writes to both storage accounts

The publish SHALL upload every file to the public game data container in the dev and prod accounts, replacing what each account holds under the same name.

#### Scenario: Both accounts receive every file

- **GIVEN** the packs hold files
- **WHEN** the publish runs
- **THEN** each file is uploaded to both accounts under its name

#### Scenario: Rerun replaces an account's copy

- **GIVEN** an account already holds a pack's file under its name
- **WHEN** the publish runs again with a changed file
- **THEN** the account holds the changed file

### Requirement: A dry run changes no account

The publish SHALL, under the dry-run switch, report the files and bytes it would publish and make no request to either account.

#### Scenario: Dry run makes no request

- **GIVEN** the dry-run switch is set
- **WHEN** the publish runs
- **THEN** the counts are reported and no account is written

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

### Requirement: The world's tables load under the opening

The world's screen SHALL read the game's tables as soon as the player's save and every character pack are held, and SHALL start its session only when the door is opened, so the tables are already read when the startup loading screen shows.

#### Scenario: Held screen reads its tables and mounts no session

- **GIVEN** the world's screen is held
- **WHEN** its tables have arrived
- **THEN** no session is mounted

#### Scenario: Released screen opens its session

- **GIVEN** the held screen's tables have arrived
- **WHEN** the screen is released
- **THEN** its session mounts and the screen signals ready

### Requirement: The party offers only characters with a published pack

The party picker SHALL offer a team only the characters the player holds that the index lists a pack for, so every party member is drawn from its own model.

#### Scenario: Character without a published pack is not selectable

- **GIVEN** the player holds a character the index lists no pack for
- **WHEN** the player runs Quick Setup on a team
- **THEN** that character is not added to the team
