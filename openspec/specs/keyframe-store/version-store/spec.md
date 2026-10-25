# keyframe-store/version-store Specification

## Purpose

The contract a caller writes and reads versions through: each write reports the base it is stored against, a delta is read with the keyframe its own header names, and collection deletes only the objects no surviving record names.

## Requirements

### Requirement: A write reports the base its object is stored against

The store SHALL report, for each write, the base its stored object is written against, so the caller's record names the keyframe the object needs.

#### Scenario: reports the twin's object when its write lands second

- **GIVEN** two writers of identical content, each with a different anchor
- **WHEN** the second writer's create-only write is refused because the first has landed
- **THEN** the second writer reports the base of the object the first stored, and is reported as deduplicated

#### Scenario: a new keyframe reports no base

- **GIVEN** content with no anchor to encode against
- **WHEN** the content is written
- **THEN** the write reports an empty base

### Requirement: A delta is read with the keyframe its own header names

The store SHALL read a delta with the keyframe its header names, and with no other object.

#### Scenario: a delta is read with its keyframe

- **GIVEN** a stored delta
- **WHEN** the delta is read
- **THEN** the store reads the keyframe its header names and no other object

### Requirement: A delta cannot be the anchor a write encodes against

The store SHALL refuse a write whose anchor names a delta rather than a keyframe.

#### Scenario: refuses an anchor that is a delta

- **GIVEN** an anchor whose stored object is a delta
- **WHEN** a version is written against it
- **THEN** the write fails and stores nothing

### Requirement: A write against a missing anchor starts a new lineage

The store SHALL write a version as a keyframe, with an empty base, when the anchor's keyframe is no longer stored.

#### Scenario: a write against a missing anchor starts a new lineage

- **GIVEN** an anchor whose keyframe is no longer stored
- **WHEN** a version is written against it
- **THEN** the version is stored as a keyframe with an empty base

### Requirement: Collection deletes only what no surviving record names

The store SHALL delete a released object only when no retained hash names it, either as its own hash or as its base.

#### Scenario: collects only what no surviving record names

- **GIVEN** released hashes, some of which a retained record names as its base
- **WHEN** the released hashes are collected
- **THEN** only the hashes no retained record names are deleted, and the store returns them

### Requirement: A collected version reads as absent rather than as corruption

The store SHALL report a read of a collected version as absent.

#### Scenario: reports a collected version as absent rather than as corruption

- **GIVEN** a version whose object has been collected
- **WHEN** the version is read
- **THEN** the read reports the version as not stored, not as a failed verification
