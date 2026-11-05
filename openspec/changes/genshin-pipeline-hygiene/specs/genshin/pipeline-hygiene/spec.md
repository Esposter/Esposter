## ADDED Requirements

### Requirement: An export holds no absolute machine path

Every path an export or a record holds SHALL be relative to the data root, so that a copy made on another machine resolves each path without being rewritten.

#### Scenario: An export holds no absolute machine path

- **GIVEN** a completed map and a completed extraction
- **WHEN** every path they hold is read
- **THEN** none begins at a machine's own folder

#### Scenario: A block link resolves under another data root

- **GIVEN** a map copied to a machine whose data root differs
- **WHEN** its block links are followed
- **THEN** each resolves to the copied block

#### Scenario: Every machine root derives from one data root

- **GIVEN** the cache, parity, tools and fleet folders
- **WHEN** each folder's default is read
- **THEN** each begins at the one data root

### Requirement: A record has one writer

Every record the references pack or a publish takes SHALL have exactly one command that writes it, registered in one table that the pack reads.

#### Scenario: A record has one writer

- **GIVEN** the record table
- **WHEN** each record it lists is looked up
- **THEN** each names exactly one writer command

#### Scenario: A record with no writer is refused

- **GIVEN** a record file that no row of the table names
- **WHEN** the pack is given its path
- **THEN** the pack refuses it and writes nothing

### Requirement: A fit writes its record and its report

A fit SHALL write only its record and the report kept beside it, never a file a person edits.

#### Scenario: A fit leaves the authored world files as they are

- **GIVEN** an authored world file
- **WHEN** a fit publishes its record
- **THEN** the file's bytes are unchanged

#### Scenario: A fit's report is kept beside its record

- **GIVEN** a fit that has run
- **WHEN** its record is published
- **THEN** the report sits beside the record and its SHA-256 is in the publish body

### Requirement: A refit refuses an input that changed since its report

A refit of a published record SHALL refuse to run when the record it reads hashes differently from the hash its report names.

#### Scenario: A refit refuses a record whose hash differs from its report's

- **GIVEN** a report naming a record's hash
- **WHEN** the record's last publish hashes differently
- **THEN** the refit stops and names both hashes

#### Scenario: A refit runs on the record its report names

- **GIVEN** a report naming the current hash of the record
- **WHEN** the refit runs
- **THEN** it runs and its report names the same hash

### Requirement: Re-extracting leaves no stale file

A writer SHALL clear each folder it owns before it writes, so that no file an earlier run wrote survives a re-extraction.

#### Scenario: Re-extracting leaves no stale file

- **GIVEN** an extraction folder holding a file the current run no longer writes
- **WHEN** the component is extracted again
- **THEN** that file is gone

#### Scenario: A writer clears only the folder it owns

- **GIVEN** a folder that a writer does not own
- **WHEN** that writer runs
- **THEN** the files in that folder are unchanged

### Requirement: The fleet copy decides each file by its content

The fleet copy SHALL decide each file by a digest of its content rather than by its size and time, and it copies a link as the data the link points at.

#### Scenario: A file of equal size and time but other content is copied

- **GIVEN** a file whose content differs from the target's while its size and time match
- **WHEN** the fleet copy runs
- **THEN** the file is copied

#### Scenario: A link is copied as the data it points at

- **GIVEN** a link in the source folder
- **WHEN** the fleet copy runs
- **THEN** the target receives the data the link points at as a file

### Requirement: The lock check fails on a difference from the committed lock

The data verify command SHALL fail when the generated lock differs from the committed lock.

#### Scenario: Verify fails when the lock differs from the committed lock

- **GIVEN** a publish that changed the generated lock
- **WHEN** verify runs
- **THEN** it fails and names the keys that differ

#### Scenario: Verify passes when the lock matches the committed lock

- **GIVEN** a generated lock equal to the committed lock
- **WHEN** verify runs
- **THEN** it passes
