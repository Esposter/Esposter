## Purpose

Version history held as content-addressed keyframes and deltas, so a retained version costs what the edit cost instead of a full copy of the document.

## Requirements

### Requirement: A retained version is charged only for what its edit added

A retained version SHALL be charged for the bytes its edit added, not for a full copy of the document.

#### Scenario: Small edit to a large document

- **GIVEN** a large document is saved with a small edit
- **WHEN** the save's version is taken
- **THEN** the owner is charged only a few hundred bytes for it

#### Scenario: Restoring a version the history still holds

- **GIVEN** a version with the same content is already retained
- **WHEN** a version with that content is taken again
- **THEN** nothing extra is charged

### Requirement: Every retained version reads back exactly as it was taken

Every retained version SHALL read back as exactly the content it was taken from.

#### Scenario: Owner previews an older version

- **GIVEN** a retained version of a document
- **WHEN** the owner previews it
- **THEN** the content shown matches the content saved at that time

### Requirement: A version past its retention is not readable

A version whose retention has ended SHALL NOT be readable.

#### Scenario: Version expired between listing and opening

- **GIVEN** a version was listed in history
- **AND** it is swept by an unpublish before the owner opens it
- **WHEN** the owner opens it
- **THEN** the version is shown as not found

### Requirement: Damaged stored versions are reported as errors

A stored version whose bytes are truncated or do not match its record SHALL fail as an internal error and SHALL NOT be reported as not found.

#### Scenario: Stored bytes are truncated

- **GIVEN** the stored bytes of a retained version are truncated
- **WHEN** the owner opens that version
- **THEN** an internal error is reported
- **AND** the version is not reported as not found

### Requirement: Bytes no longer needed are released from the quota

Bytes that no retained version still needs SHALL be released and SHALL stop counting against the owner's storage quota.

#### Scenario: Old revisions are evicted

- **GIVEN** a revision passes its retention period and a newer revision is taken
- **WHEN** the older revision is evicted
- **THEN** the bytes only it needed are released from the owner's quota

#### Scenario: Keyframe still needed by a later version

- **GIVEN** a later retained version is stored as a change against an older keyframe
- **WHEN** the older version is evicted
- **THEN** the keyframe's bytes are kept for the later version

### Requirement: Writing and evicting versions do not interfere

Taking a version and removing old versions of the same resource SHALL NOT interfere with each other, and every retained version SHALL stay readable.

#### Scenario: Save overlaps with an eviction

- **GIVEN** an eviction of a resource's old versions is running
- **WHEN** a new version of the same resource is taken at the same time
- **THEN** every retained version can still be read

### Requirement: A failed release keeps the bytes counted until purge

If releasing evicted bytes fails, the bytes SHALL remain counted against the owner until the resource is purged.

#### Scenario: Release fails after eviction

- **GIVEN** a version was evicted and its bytes could not be released
- **WHEN** the owner checks their storage usage
- **THEN** the bytes still count against the owner
- **AND** they are released when the resource is purged

### Requirement: Versions written before this store are not restorable

Versions written before this store existed SHALL NOT be restorable, so a resource published before then SHALL be published again to have history.

#### Scenario: Resource published before the store existed

- **GIVEN** a resource was published before the store existed
- **WHEN** the owner views its version history
- **THEN** its older versions are not listed
- **AND** a new publish starts its history
