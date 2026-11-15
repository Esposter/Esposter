## ADDED Requirements

### Requirement: An archive index lists its named entries

The reader SHALL list an archive index's named entries with each one's name, stored size and offset, skipping its empty slots, and refuse bytes that do not open with the index's magic.

#### Scenario: An index lists its named entries

- **GIVEN** an index of three slots, the second empty
- **WHEN** it is read
- **THEN** it lists the first and third entries, each with its 8.3 name lowercased and its padding removed, its stored size and its offset

#### Scenario: Bytes without the index magic are refused

- **GIVEN** bytes that open with anything but the index magic
- **WHEN** they are read as an index
- **THEN** the read fails with an error saying the bytes are not an archive index

### Requirement: An entry comes back as its original bytes

The reader SHALL return an entry's original bytes from its archive data, decompressing an entry its index marks compressed and returning a stored one as it is.

#### Scenario: A compressed entry comes back decompressed

- **GIVEN** an entry whose stored bytes are a frame stream holding one mode A frame and one mode B frame
- **WHEN** the entry is read
- **THEN** the result is the two frames' decoded bytes in order

#### Scenario: A stored entry comes back as it is

- **GIVEN** an entry whose stored size equals its allocation and whose extension is not on the compressed list
- **WHEN** the entry is read
- **THEN** the result is the stored bytes unchanged

#### Scenario: A hidden DDS is never decompressed

- **GIVEN** an entry with a listed extension whose stored bytes start with the DDS magic
- **WHEN** the entry is read
- **THEN** the result is the stored bytes unchanged

### Requirement: A damaged frame stream fails rather than returning short

The reader SHALL fail a frame stream that runs past its payload, refers back before the start of its window, or does not end where its frame says, naming the entry, and never return a partial result.

#### Scenario: A back-reference before the window's start fails the read

- **GIVEN** a mode A frame whose first instruction refers back four bytes
- **WHEN** the entry is read
- **THEN** the read fails with an error naming the entry
- **AND** no bytes are returned
