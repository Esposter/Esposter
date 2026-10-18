## Purpose

A large document's save crosses the wire as a zstd frame compressed against the bytes the server already stores, so an edit to a near-identical document costs kilobytes whatever its size, with any mismatch falling back to a full save inside the same queued call. The owner never sees a failure caused by the delta path.

## Requirements

### Requirement: A small edit to a large document saves a small payload

The system SHALL save a large document's edit as a delta sized to the change, once the client holds the stored copy.

#### Scenario: Changing one cell in a large sheet uploads kilobytes

- **GIVEN** the owner has a large sheet open and has saved it once
- **WHEN** they change one cell and the sheet autosaves
- **THEN** the upload is kilobytes rather than the whole document

#### Scenario: The first save of a loaded document is already a delta

- **GIVEN** the owner has just loaded a large document
- **WHEN** they make a change and it saves
- **THEN** the save is sent as a delta

### Requirement: The saved document is the same whichever way it was sent

The system SHALL store the same document whether a save was sent as a delta or in full, and SHALL show the owner the same content afterwards.

#### Scenario: A delta save reads back the same content

- **GIVEN** the owner changes one cell in a large document
- **WHEN** the delta save finishes and the document is reloaded
- **THEN** the reloaded document shows the changed cell and every other cell unchanged

### Requirement: A stale baseline falls back to a full save without an error

The system SHALL fall back to a full save inside the same queued call when the stored copy has changed since the client last held it, and SHALL NOT show the owner an error for it.

#### Scenario: A save from another device forces a full save

- **GIVEN** the owner's document was changed on another device after this one last loaded it
- **WHEN** this device saves a change
- **THEN** the save goes through in full
- **AND** the owner sees no error

#### Scenario: A restore forces a full save

- **GIVEN** the document was restored from a snapshot while this device had it open
- **WHEN** this device saves a change
- **THEN** the save goes through in full
- **AND** the owner sees no error

### Requirement: An edit too large for one request falls back to a full save

The system SHALL save an edit in full when its delta does not fit in one request, and SHALL NOT refuse the save for its size.

#### Scenario: A very large edit saves in full

- **GIVEN** the owner has pasted a very large block of content
- **WHEN** the save runs
- **THEN** the save goes through in full
- **AND** no error is shown

### Requirement: The delta path never adds a way for a save to fail

The system SHALL NOT let an error in the delta path fail a save that a full save would have completed.

#### Scenario: A failing compressor still saves

- **GIVEN** the compression step for a delta fails
- **WHEN** the owner saves
- **THEN** the save goes through in full
- **AND** the owner sees no error

### Requirement: Content is still checked as a whole on every save

The system SHALL validate the whole document on every save, including a delta save, before storing it.

#### Scenario: An invalid edit is refused on a delta save

- **GIVEN** the owner's edit would leave the document invalid
- **WHEN** the owner saves it as a delta
- **THEN** the save is refused as it would be for a full save
