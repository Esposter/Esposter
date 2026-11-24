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

The publish SHALL, under the dry-run switch, report the files and bytes it would publish and write to neither account.

#### Scenario: Dry run writes to no account

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

### Requirement: Downloads are shown on the launch loading bar

The download of the character packs and of the game data lock's objects and indexes SHALL run from the moment the opening mounts, and the launch loading bar, the game's plain bar on its login screen, SHALL show the share of that download held, whole once every file is held. The bar SHALL show that share alone, as the game's bar does, and no bytes or size.

#### Scenario: Downloads are shown on the launch loading bar

- **GIVEN** files remain to download when the opening mounts
- **WHEN** the login screen's bar shows
- **THEN** the bar's share is the bytes held over the bytes pending
- **AND** the bar is whole once every file is held

#### Scenario: Nothing pending shows a whole bar

- **GIVEN** the browser keeps every file
- **WHEN** the login screen's bar shows
- **THEN** the bar is whole
- **AND** no size is shown

### Requirement: The elemental loading screen shows no download progress

The elemental loading screen SHALL show only the world's own loading, its bar the share of the world's steps, and SHALL show no words, so no download's bytes, line or retry reach it.

#### Scenario: The elemental loading screen shows no download progress

- **GIVEN** files remain to download, or a download has failed
- **WHEN** the elemental loading screen is shown
- **THEN** its bar is the share of the world's steps alone
- **AND** no download's bytes, line or retry is shown on it

### Requirement: A failed download stops the loading and can be retried

A pack file SHALL be attempted three times, and when the third fails the launch loading bar SHALL stop with the game's failure line and a retry that fetches only the files not yet kept.

#### Scenario: Retry fetches only what is missing

- **GIVEN** a file failed all three attempts and the others were kept
- **WHEN** the player retries
- **THEN** only the failed file and any not yet kept are fetched

#### Scenario: Failure never enters the world without the model

- **GIVEN** a file failed all three attempts
- **WHEN** the loading stops
- **THEN** the failure line and the retry are shown on the launch loading bar
- **AND** the world is not shown until the download completes

### Requirement: The world's tables load under the opening

The world's screen SHALL read the game's tables as soon as the player's save and every published character pack are held, and SHALL start its session only when the door is opened, so the tables are already read when the startup loading screen shows.

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
