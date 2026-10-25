# keyframe-store/object-format Specification

## Purpose

TBD - created by archiving change keyframe-store-area. Update Purpose after archive.

## Requirements

### Requirement: An object is addressed by the hash of its plaintext

The store SHALL address each object by the SHA-256 of its plaintext, so the same content has one address whichever keyframe either write would have encoded against.

#### Scenario: adopts content it already holds instead of writing it again

- **GIVEN** an object already stored under the address of some content
- **WHEN** the same content is written again
- **THEN** the store writes nothing and reports the write as deduplicated

### Requirement: A version is written as a keyframe or as a delta against one keyframe

The store SHALL write each version as a keyframe, compressed on its own, or as a delta compressed against exactly one keyframe.

#### Scenario: round-trips a keyframe and the delta anchored to it to the exact input bytes

- **GIVEN** a keyframe and a version that differs from it by a small edit
- **WHEN** the version is written against that keyframe and read back
- **THEN** the bytes read are the bytes written

#### Scenario: promotes a wholesale rewrite to a keyframe

- **GIVEN** a keyframe and a version rewritten wholesale
- **WHEN** the version is written against that keyframe
- **THEN** it is stored as a keyframe

### Requirement: A delta is kept only within the segment budget

The store SHALL write a version as a keyframe, rather than a delta, once the bytes anchored to its keyframe would exceed the segment budget.

#### Scenario: promotes once the bytes anchored to a keyframe reach the segment budget

- **GIVEN** a keyframe whose deltas already total its segment budget
- **WHEN** another small edit is written against it
- **THEN** the edit is stored as a keyframe

### Requirement: A read is verified against the address it was read by

The store SHALL return a version only when its bytes hash to the address it was read by.

#### Scenario: refuses an object that does not decode to its key

- **GIVEN** a stored object whose bytes decode to content other than its address
- **WHEN** the object is read
- **THEN** the read fails and returns no plaintext

### Requirement: Bytes outside the format are refused, not decoded

The store SHALL refuse an object that does not open with the format's magic and a known flag.

#### Scenario: refuses bytes that do not open with the format's magic

- **GIVEN** stored bytes that do not begin with the format's magic
- **WHEN** the object is read
- **THEN** the read fails without handing the bytes to the decompressor
