## Purpose

Every user-written blob prefix has a naming discipline that decides its teardown, and exactly one owner per lifecycle event — all sweeps through publishBlobDeletion.

## Requirements

### Requirement: File naming decides how a file is torn down

Each stored file name SHALL either stay fixed and be overwritten in place, or be unique per upload with a sweep that removes its superseded copies.

#### Scenario: A fixed-name file is replaced in place

- **GIVEN** a file stored under a fixed name
- **WHEN** a new version is uploaded
- **THEN** the new version overwrites the old one and nothing accumulates

#### Scenario: Superseded uploads are swept when replaced

- **GIVEN** files stored under unique names per upload
- **WHEN** a replacement is saved
- **THEN** every earlier version is removed except the one now in use

#### Scenario: Deleting a parent removes every file under it

- **WHEN** an entity that owns stored files is deleted
- **THEN** every file under that entity's prefix is removed

### Requirement: Every removal of stored files is durable

Every removal of stored files SHALL be queued durably and retried, and SHALL NOT be performed inline at the point of the change.

#### Scenario: A failed removal is retried later

- **GIVEN** a removal that fails
- **WHEN** the failure occurs
- **THEN** the removal is retried later rather than lost

#### Scenario: A removal completes after its request has ended

- **GIVEN** a removal queued by a request
- **WHEN** the request ends before the removal runs
- **THEN** the removal still runs

### Requirement: A removal naming files from the request requires proof of the grant

A file removal that names files from the request SHALL be accepted only with proof that the caller was granted those files, and the whole request SHALL be refused otherwise.

#### Scenario: The uploader removes their own upload

- **GIVEN** a caller holding the proof issued with their upload
- **WHEN** the caller removes the upload
- **THEN** the upload is removed

#### Scenario: A request without proof is refused

- **GIVEN** a caller who holds no proof for a file
- **WHEN** the caller asks for that file to be removed
- **THEN** the whole request is refused and no file is removed

#### Scenario: Proof older than the upload window is refused

- **GIVEN** proof issued before the upload window closed
- **WHEN** the caller asks for removal after the window has closed
- **THEN** the request is refused

### Requirement: A file name from the request is a single segment

A file name supplied by a caller SHALL be a single segment with no separators and no relative parts, and any other name SHALL be refused.

#### Scenario: A name with a relative part is refused

- **WHEN** a caller supplies a file name containing a relative path part
- **THEN** the request is refused before any file is touched

### Requirement: A removal targets only names the system listed

A removal SHALL target only names the system itself listed, and SHALL NOT derive a removal target from a value read back from storage.

#### Scenario: A stored address is not treated as a file to remove

- **GIVEN** a stored image address that points outside the system's own names
- **WHEN** a room's image is replaced
- **THEN** the stored address is not removed and the current image is kept

### Requirement: A folder removal queued earlier spares a re-upload

A removal of a whole folder queued before a re-upload SHALL NOT delete the re-upload, and a removal of a deleted entity's whole folder SHALL run without a time bound.

#### Scenario: A republish after the removal was queued survives a replay

- **GIVEN** a folder removal queued before a republish
- **WHEN** the removal is delivered or replayed after the republish
- **THEN** the republished files are kept

#### Scenario: A deleted room's folder is removed completely

- **WHEN** a room is deleted
- **THEN** every attachment under its prefix is removed

### Requirement: A large folder removal proceeds in bounded waves

A removal of a large folder SHALL proceed in bounded waves rather than all at once, so that a replay converges on the same result.

#### Scenario: A room with many attachments is removed in waves

- **GIVEN** a room with tens of thousands of attachments
- **WHEN** the room is deleted
- **THEN** the attachments are removed in bounded waves and a replay leaves nothing behind

### Requirement: A copied file is never given the name of a deleted file

A copied file SHALL receive a new name rather than the name of the source it was copied from.

#### Scenario: A restored file survives a replay of an earlier deletion

- **GIVEN** a file that was deleted and later restored from a snapshot
- **WHEN** the earlier deletion is replayed
- **THEN** the restored file is kept

### Requirement: A replaced image is removed only on a real change and only when old

A replaced image SHALL be removed only when the saved value actually changes and only when the removed version is older than the upload window.

#### Scenario: A rename alone removes nothing

- **WHEN** a room is saved with a new name and the same image
- **THEN** no image is removed

#### Scenario: A recent image is kept even when the room drops it

- **GIVEN** an image uploaded by another admin within the upload window
- **WHEN** a save replaces the room's image with a stale address
- **THEN** the recent image is kept

### Requirement: Each stored file kind has exactly one owner for each lifecycle event

Each user-written file kind SHALL have exactly one teardown owner for each lifecycle event, recorded before the kind ships.

#### Scenario: A new file kind without an owner is rejected in review

- **WHEN** a change adds a stored file kind with no recorded owner for its removal
- **THEN** the review rejects the change until the owner is recorded
