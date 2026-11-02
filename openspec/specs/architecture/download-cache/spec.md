## Purpose

The machine-wide cache that serves each download once per machine, keyed by the SHA-256 of its bytes, so every checkout, worktree and ephemeral run reads the same copy.

## Requirements

### Requirement: A cached object is read from the cache without a download

The download cache SHALL return an object the cache already holds without downloading it again.

#### Scenario: reads an object the cache holds without downloading it

- **GIVEN** an object the cache already holds under its hash
- **WHEN** the object is requested
- **THEN** its bytes are read from the cache
- **AND** nothing is downloaded

### Requirement: A download is kept only when its bytes hash to its name

The download cache SHALL keep a downloaded object only when its bytes hash to the name it was requested under, and SHALL refuse the download otherwise.

#### Scenario: keeps a download that hashes to its name

- **GIVEN** an object that is not yet cached
- **WHEN** it is downloaded and its bytes hash to the requested name
- **THEN** the bytes are kept in the cache and returned

#### Scenario: refuses a download that does not hash to its name

- **GIVEN** an object that is not yet cached
- **WHEN** the download's bytes do not hash to the requested name
- **THEN** the download is refused
- **AND** nothing is kept in the cache

### Requirement: A failed write leaves no part file behind

The download cache SHALL remove the part file of a write or rename that fails, so an object that did not reach its name leaves nothing in the content folder.

#### Scenario: removes the part file a failed write leaves behind

- **GIVEN** an object that is not yet cached and whose bytes hash to the requested name
- **WHEN** writing its part file fails after the file is created
- **THEN** the part file is removed
- **AND** the write's error is raised, since no cached object holds the name

### Requirement: A name is refused before any path is built from it

The download cache SHALL refuse a name that is not a SHA-256 hex digest before it builds a path from the name.

#### Scenario: refuses a name that climbs out of the directory

- **GIVEN** a name containing path separators or parent-directory segments
- **WHEN** the object is requested under that name
- **THEN** the request is refused before any file is read or written
