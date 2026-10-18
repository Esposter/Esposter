## Purpose

Every JSON document the app stores in Blob Storage is a zstd frame served with Content-Encoding zstd, written by one writer and read by one reader, so the blob, its quota charge and every read shrink several times over and any change to the path reaches every document at once.

## Requirements

### Requirement: Stored documents are kept compressed

Every JSON document the app keeps in blob storage SHALL be stored compressed and marked with its content encoding, so the stored bytes are a fraction of the JSON they hold.

#### Scenario: A resource's content is saved compressed

- **GIVEN** a reader has a resource with content
- **WHEN** the reader saves the content
- **THEN** the stored blob is compressed
- **AND** the blob is marked with the content encoding a browser decodes on read

#### Scenario: A game save is stored compressed

- **GIVEN** a player is in a game that saves progress
- **WHEN** the game writes the player's save
- **THEN** the save is stored compressed

### Requirement: Every JSON document uses one write and read path

Every JSON document SHALL be written and read through one shared path, so a change to the stored format applies to every document at once.

#### Scenario: A format change reaches every document on its next save

- **GIVEN** the stored format of JSON documents has been changed
- **WHEN** any resource's content or any game save is next written
- **THEN** it is written in the changed format

### Requirement: A browser reads stored content without decoding it

A browser that reads a stored document through a signed link SHALL receive the plain JSON bytes without decoding them itself.

#### Scenario: A large resource is read through a signed link

- **GIVEN** a large resource's content is stored compressed
- **WHEN** the browser fetches that content through a signed link
- **THEN** the browser receives the JSON the content's hash describes

### Requirement: Resource hash and size describe the JSON while the charge counts stored bytes

A resource's content hash and content size SHALL describe the JSON, while the owner's storage charge SHALL count the stored length.

#### Scenario: Saving content records the JSON hash and the stored charge

- **GIVEN** a reader saves a resource's content
- **WHEN** the save completes
- **THEN** the content hash is the hash of the JSON
- **AND** the content size is the length of the JSON
- **AND** the owner is charged the length of the stored bytes

#### Scenario: Reconciled usage matches the stored lengths

- **GIVEN** a resource's content was saved in compressed form
- **WHEN** the owner's storage usage is reconciled
- **THEN** the usage equals the sum of the stored lengths

### Requirement: A save that cannot be compressed stores nothing

A save SHALL store nothing and report failure when its document cannot be compressed.

#### Scenario: Compression fails during a resource save

- **GIVEN** a resource's content cannot be compressed
- **WHEN** the reader saves the content
- **THEN** nothing is stored
- **AND** the resource's version does not advance
- **AND** the reader sees the save fail

### Requirement: A game load reports a read it cannot complete

A game load SHALL report a save it cannot read rather than start a fresh game over it.

#### Scenario: A failed read does not start a fresh game

- **GIVEN** a player has a saved game
- **WHEN** the game loads and the read fails
- **THEN** the player sees an error
- **AND** no fresh game starts
- **AND** the saved progress is left as it was

#### Scenario: A save that no longer parses starts a fresh game

- **GIVEN** a player's stored save no longer parses
- **WHEN** the game loads
- **THEN** a fresh game starts

#### Scenario: A player with no save starts a fresh game

- **GIVEN** a player has never saved
- **WHEN** the game loads
- **THEN** a fresh game starts

### Requirement: Compression does not hold up other requests

Compressing and decompressing a stored document SHALL NOT delay other requests the server is answering.

#### Scenario: A large save does not delay page requests

- **GIVEN** a large document is being saved
- **WHEN** other readers request pages
- **THEN** those requests are answered without waiting for the compression to finish
