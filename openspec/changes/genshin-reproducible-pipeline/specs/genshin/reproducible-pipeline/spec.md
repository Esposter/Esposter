## ADDED Requirements

### Requirement: Every export, fit input and record carries a provenance stamp

Every export, fit input and record the pipeline writes SHALL carry a provenance stamp beside it, naming the game version of the install it was read from, the tool that wrote it and its version, the operating system and the command that ran.

#### Scenario: A written export carries its stamp beside it

- **GIVEN** an install whose game version is known
- **WHEN** a component's extraction finishes
- **THEN** the component's output folder holds a stamp naming that game version and the command that ran

#### Scenario: A reader reports output made before a later change to its producer

- **GIVEN** an extraction whose stamp names an earlier commit of the code that wrote it
- **WHEN** the world is read from that extraction
- **THEN** the stale output is reported

### Requirement: A consumer refuses an input whose stamp names another game version

A fit, the map and the fleet copy SHALL refuse an input whose stamp names another game version than the install's, or that carries no stamp.

#### Scenario: A fit refuses an export stamped with another game version

- **GIVEN** an export whose stamp names a game version other than the install's
- **WHEN** a fit reads the export
- **THEN** the fit stops and names both game versions

#### Scenario: A fit refuses an export with no stamp

- **GIVEN** an export that carries no stamp
- **WHEN** a fit reads the export
- **THEN** the fit stops and names the missing stamp

#### Scenario: The map is remade for another game version

- **GIVEN** a map whose stamp names a game version other than the install's
- **WHEN** the map command runs
- **THEN** the map is made again and the earlier one is replaced

#### Scenario: The fleet copy refuses a folder stamped with another game version

- **GIVEN** a peer's folder whose stamp names another game version than the install's
- **WHEN** the fleet copy runs
- **THEN** it copies nothing from that folder

### Requirement: One stamp form is written

The pipeline SHALL write one stamp form, and no writer SHALL leave an earlier stamp file beside its output.

#### Scenario: An extraction leaves no earlier stamp file

- **GIVEN** an extraction folder holding a stamp written by an earlier form of the pipeline
- **WHEN** the component is extracted again
- **THEN** the folder holds the one stamp form and no earlier stamp file

### Requirement: A fetched source is pinned to a commit

Every external source a command fetches SHALL be fetched at a commit whose SHA is set in one constant and recorded in the output's stamp, never at a branch.

#### Scenario: A fetched source is pinned to a commit

- **GIVEN** a command that fetches an external source
- **WHEN** the command runs
- **THEN** it requests the commit its constant names and records that SHA in the output's stamp

#### Scenario: A moved branch does not change a run

- **GIVEN** the source's branch holds a newer commit than the pinned one
- **WHEN** the command runs
- **THEN** it reads the pinned commit and the output is unchanged

### Requirement: A tool is installed from its pinned archive

Every tool a stage runs SHALL be installed from its pinned archive, checked by its SHA-256, and found at that install rather than on the PATH.

#### Scenario: A tool whose archive fails its SHA-256 is refused

- **GIVEN** a downloaded archive whose hash differs from the pinned one
- **WHEN** the tool is installed
- **THEN** nothing is installed and the stage stops

#### Scenario: A stage ignores a tool of the same name on the PATH

- **GIVEN** a different tool of the same name on the PATH
- **WHEN** the stage runs
- **THEN** it runs its pinned install

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

### Requirement: A Mac decoder is accepted only at the Windows counts

The macOS AnimeStudio build SHALL be accepted only when its file count for each reference block equals the count committed beside the build for the Windows build.

#### Scenario: A Mac build whose counts differ from the Windows counts is refused

- **GIVEN** a Mac build whose count for a reference block differs from the committed count
- **WHEN** the build's parity check runs
- **THEN** the build publishes nothing and names the block

#### Scenario: The Windows counts are committed beside the build

- **GIVEN** the repository
- **WHEN** the counts file is read
- **THEN** it names every reference block with the count the Windows build gave

### Requirement: The game-running guard reads the process list on macOS

The game-running guard SHALL refuse a block run while the game is running on macOS, as it does on Windows.

#### Scenario: A block run refuses while the game is running on macOS

- **GIVEN** the game process is running on macOS
- **WHEN** a block run starts
- **THEN** the run stops and names the game

#### Scenario: A block run proceeds when the game is not running on macOS

- **GIVEN** no game process is running on macOS
- **WHEN** a block run starts
- **THEN** the run proceeds

### Requirement: A measured value names its capture

Every hand-set fit constant and every value measured from a capture SHALL be written in a measurement file that names the capture and the frame it was read from.

#### Scenario: A measured value names the capture it was read from

- **GIVEN** a measurement file
- **WHEN** its entries are read
- **THEN** each entry names a capture and a frame

#### Scenario: A measurement entry with no capture is refused

- **GIVEN** a measurement entry that names no capture
- **WHEN** the file is read
- **THEN** the read is refused and names the entry

### Requirement: A fresh pair publishes the same lock from one install

A fresh PC and Mac pair, each holding the install, SHALL publish the same lock from the same install.

#### Scenario: A fresh pair publishes the same lock from one install

- **GIVEN** a fresh checkout on the PC and a fresh checkout on the Mac, each holding the install
- **WHEN** each runs the pipeline to its publish
- **THEN** the two generated locks are the same file
