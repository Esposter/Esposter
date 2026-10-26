## Purpose

A player loads the official release they downloaded on the character screen, the browser keeps its files, and a signed-in player's own copy is kept with their account, readable by them alone.

## Requirements

### Requirement: A downloaded release loads onto its character and is kept in the browser

The character screen SHALL let a player load an official release they downloaded for the character it shows, and the browser SHALL keep it so a returning player draws it without importing it again.

#### Scenario: Picking a release offers its terms first

- **GIVEN** a character is drawn as its capsule
- **WHEN** the player picks the downloaded release for it
- **THEN** the release's terms are offered before anything is kept

#### Scenario: Returning player draws the kept release

- **GIVEN** a release for the character is kept in the browser
- **WHEN** the player returns to the character screen
- **THEN** the model is drawn without another import

#### Scenario: Removing a kept release returns the capsule

- **GIVEN** a release for the character is kept in the browser
- **WHEN** the player removes it
- **THEN** the character is drawn as its capsule again

### Requirement: A release is kept only after its terms are accepted

A release SHALL be kept only after the player accepts its terms, and the terms SHALL be shown verbatim.

#### Scenario: Cancelling keeps nothing

- **GIVEN** a release's terms are shown
- **WHEN** the player cancels
- **THEN** nothing is kept

#### Scenario: Accepting keeps the release

- **GIVEN** a release's terms are shown
- **WHEN** the player accepts them
- **THEN** the release is kept

#### Scenario: Folder with no terms is refused

- **GIVEN** a release folder holds no terms file
- **WHEN** it is picked
- **THEN** the release is refused
- **AND** the reason is shown and nothing is kept

#### Scenario: Unreadable terms say so

- **GIVEN** a drawn model's terms cannot be read
- **WHEN** the player opens them
- **THEN** the panel says the terms could not be loaded

### Requirement: A pick of several releases reads each one separately

A pick of several releases SHALL read each release separately, naming and skipping any that fail, so that one failure does not stop the rest.

#### Scenario: Unreadable zip is named and skipped

- **GIVEN** several zips are picked
- **WHEN** one of them is not a readable zip
- **THEN** that zip is named and skipped
- **AND** the others are read

#### Scenario: Several releases share one terms dialog

- **GIVEN** several releases are picked and read
- **WHEN** their terms are shown
- **THEN** all of the terms appear in one dialog
- **AND** they are accepted one at a time

### Requirement: A release is kept for the character it names

A release SHALL be kept for the character its models or folders name, and a release naming no character or several SHALL be kept for the character it was picked for.

#### Scenario: Release for another character says so

- **GIVEN** a release naming another character is picked
- **WHEN** its terms are shown
- **THEN** the dialog says the release is for that character

#### Scenario: Release naming no character is kept for the picked one

- **GIVEN** a release names no character, or several
- **WHEN** it is picked for a character
- **THEN** it is kept for the character it was picked for

### Requirement: Archive names are read in the encoding they were written in

A zip's file names SHALL be read in the encoding they were written in, so that names come out as the release wrote them.

#### Scenario: Names written in GBK read correctly

- **GIVEN** a zip's names are written in GBK
- **WHEN** the zip is read
- **THEN** the names come out as the Chinese characters the release wrote

#### Scenario: Names that read in no encoding are repaired

- **GIVEN** a zip's names read in no encoding as written, because the archiver wrote a slash for a backslash after a lead byte
- **WHEN** the zip is read
- **THEN** the backslash is restored and the names match the release

#### Scenario: Macintosh resource entries are passed over

- **GIVEN** a zip holds macOS resource entries
- **WHEN** the zip is read
- **THEN** those entries are passed over

### Requirement: An extracted folder is read with its model, textures and terms wherever nested

An extracted release folder SHALL be read as one release, with its model, textures and terms found wherever it nests them, matched without regard to letter case or spacing.

#### Scenario: Several models choose the one named as the character

- **GIVEN** a folder holds several model files
- **WHEN** it is read
- **THEN** the model named as the chosen character is used

#### Scenario: Several models and none named is refused

- **GIVEN** a folder holds several model files and none is named as the character
- **WHEN** it is read
- **THEN** the release is refused
- **AND** each model is named in the refusal

#### Scenario: Texture matched regardless of letter case

- **GIVEN** a model names a texture with different letter case from the file
- **WHEN** the folder is read
- **THEN** the texture is matched to its file

#### Scenario: Missing texture keeps the release

- **GIVEN** a model names a texture the release does not ship
- **WHEN** the folder is read
- **THEN** the release is still kept
- **AND** the material that uses the texture is drawn without it

#### Scenario: Texture path leaving the folder matches nothing

- **GIVEN** a model names a texture by a path that climbs out of its folder
- **WHEN** the folder is read
- **THEN** that texture matches no file

### Requirement: A RAR release is loaded from its extracted folder

A RAR archive SHALL be loaded only from its extracted folder, since the page does not read RAR archives.

#### Scenario: RAR archive is extracted by the player

- **GIVEN** a RAR archive is picked to load
- **WHEN** the player loads it
- **THEN** the player extracts it and picks the extracted folder instead

### Requirement: A kept release is stored whole and rolled back on failure

A kept release SHALL be stored whole before the character's record names it, and a storage failure SHALL leave the stored releases as they were.

#### Scenario: Full storage removes the partial release

- **GIVEN** a release is being kept
- **WHEN** a file or the record fails to write because storage is full
- **THEN** the partly written release is removed
- **AND** the loader says the browser's storage is full

#### Scenario: Keeping the same release again writes nothing new

- **GIVEN** the same release is already kept for the character
- **WHEN** it is kept again
- **THEN** its files are not written again

#### Scenario: Replacing a release removes the old one after the new is named

- **GIVEN** a character has a kept release
- **WHEN** a new release is kept for it
- **THEN** the old release is removed after the new one is named

#### Scenario: Unreadable record is rebuilt from the stored folders

- **GIVEN** the record of kept releases cannot be read
- **WHEN** the page loads
- **THEN** the record is rebuilt from the stored folders
- **AND** the kept releases are still drawn

### Requirement: A signed-in player's accepted release is kept with the account

A signed-in player's accepted release SHALL be kept with their account, and SHALL be kept only when each uploaded file matches its declared size and hash.

#### Scenario: Signed-in player's release is listed on the account

- **GIVEN** a signed-in player accepts a release
- **WHEN** its files are uploaded
- **THEN** the release is listed on the account
- **AND** it is drawn on any device the player signs in on

#### Scenario: Uploaded file of the wrong size refuses the keep

- **GIVEN** an uploaded file's length differs from its declared size
- **WHEN** the keep runs
- **THEN** the keep is refused

#### Scenario: Uploaded file with the wrong hash refuses the keep

- **GIVEN** an uploaded file's hash differs from the hash claimed for it
- **WHEN** the keep runs
- **THEN** the keep is refused

### Requirement: Upload grants are held against the account's storage quota

An upload grant SHALL be held against the account's storage quota, and no grant SHALL be issued that would take the account past its quota.

#### Scenario: Grant over the quota is refused

- **GIVEN** an account is near its storage quota
- **WHEN** it asks for upload grants whose sizes would exceed the quota
- **THEN** the request is refused

### Requirement: A kept release's files are readable only by its owner

A kept release's files SHALL be served only to the account whose list names them, as private responses that no shared cache holds.

#### Scenario: Owner reads a file of their own release

- **GIVEN** a signed-in player whose list names a file's hash
- **WHEN** that file is requested
- **THEN** its bytes are served as a private response

#### Scenario: Another account's file is not served

- **GIVEN** a signed-in player whose list does not name a file's hash
- **WHEN** that file is requested
- **THEN** no file is served and the request gets a not-found response

#### Scenario: No session is refused

- **GIVEN** no session is signed in
- **WHEN** a kept file is requested
- **THEN** the request is refused as unauthorised

### Requirement: Removing a kept release drops it from the list and keeps its bytes

Removing a kept release SHALL drop it from the account's list, and its stored files SHALL stay for any other account that keeps the same bytes.

#### Scenario: Removed release is no longer listed

- **GIVEN** the account lists a release
- **WHEN** the player removes it
- **THEN** it is no longer listed on the account
- **AND** its stored files are left in place
