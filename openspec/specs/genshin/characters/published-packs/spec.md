# genshin/characters/published-packs Specification

## Purpose

The official character packs are published to the public game data container, each file under its avatar id, so a browser can read a character's model from the app's storage.

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
