## ADDED Requirements

### Requirement: Every export, fit input and record carries a provenance stamp

Every export, fit input and record the pipeline writes SHALL carry a provenance stamp naming the game version of the install it was read from, the tool and its version, the operating system, the command and the sources it was built from. A folder output holds its stamp inside the folder, and a file output has its stamp as a sidecar beside the file, named as the design gives. The lock is not stamped.

#### Scenario: A written export carries its stamp beside it

- **GIVEN** an install whose game version is known
- **WHEN** a component's extraction finishes
- **THEN** the component's output folder holds a stamp naming that game version and the command that ran

#### Scenario: A file output carries its stamp in a sidecar beside it

- **GIVEN** a fit record written to the world-data folder
- **WHEN** the fit writes the record
- **THEN** a sidecar `<file name>.provenance.json` beside the record names that game version and the command that wrote it

#### Scenario: A reader reports output made before a later change to its producer

- **GIVEN** an extraction whose stamp names an earlier commit of the code that wrote it
- **WHEN** the world is read from that extraction
- **THEN** the stale output is reported

### Requirement: A consumer refuses an input whose stamp names another game version

A fit SHALL refuse an input whose stamp names another game version than the install's, or that carries no stamp. The map SHALL be made again when its stamp names another game version. The fleet copy SHALL refuse each path a stamp of another game version covers, and SHALL copy every other path. A fit SHALL read a record only through its sidecar's refusal, and the fleet copy SHALL read a peer's stamps before it chooses the files a stamp covers.

#### Scenario: A fit refuses an export stamped with another game version

- **GIVEN** an export whose stamp names a game version other than the install's
- **WHEN** a fit reads the export
- **THEN** the fit stops and names both game versions

#### Scenario: A fit refuses an export with no stamp

- **GIVEN** an export that carries no stamp
- **WHEN** a fit reads the export
- **THEN** the fit stops and names the missing stamp

#### Scenario: A fit refuses a record whose sidecar names another game version

- **GIVEN** a fit record whose sidecar names a game version other than the install's
- **WHEN** a fit reads the record
- **THEN** the fit stops and names both game versions

#### Scenario: The map is remade for another game version

- **GIVEN** a map whose stamp names a game version other than the install's
- **WHEN** the map command runs
- **THEN** the map is made again and the earlier one is replaced

#### Scenario: The fleet copy refuses a folder stamped with another game version

- **GIVEN** a peer's folder whose stamp names another game version than the install's
- **WHEN** the fleet copy runs
- **THEN** it copies nothing from that folder

#### Scenario: The fleet copy refuses a file stamped with another game version

- **GIVEN** a peer's file whose sidecar names another game version than the install's
- **WHEN** the fleet copy runs
- **THEN** it copies neither that file nor its sidecar, and copies the other files that no stamp refuses

#### Scenario: The fleet copy refuses a subtree whose folder above it is stamped with another game version

- **GIVEN** a peer's folder whose stamp names another game version than the install's, and a changed directory beneath it
- **WHEN** the fleet copy runs
- **THEN** it copies nothing from that directory, even though the directory's own digest changed alone

#### Scenario: A machine with no install copies a stamped folder

- **GIVEN** a machine with no game install, so no game version to hold a stamp to
- **WHEN** the fleet copy pulls a folder stamped with a game version
- **THEN** it copies the folder's files

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

Every tool a stage runs, other than the system's tar and sysctl, SHALL be installed from its pinned archive, checked by its SHA-256, and found at that install rather than on the PATH.

#### Scenario: A tool whose archive fails its SHA-256 is refused

- **GIVEN** a downloaded archive whose hash differs from the pinned one
- **WHEN** the tool is installed
- **THEN** nothing is installed and the stage stops

#### Scenario: A stage ignores a tool of the same name on the PATH

- **GIVEN** a different tool of the same name on the PATH
- **WHEN** the stage runs
- **THEN** it runs its pinned install

#### Scenario: The system's tar and sysctl run from their system paths

- **GIVEN** a stage that unpacks a zip or reads the operating system's build
- **WHEN** the stage runs
- **THEN** it runs the system's tar or sysctl from its system path
- **AND** a tool of the same name on the PATH is not run
