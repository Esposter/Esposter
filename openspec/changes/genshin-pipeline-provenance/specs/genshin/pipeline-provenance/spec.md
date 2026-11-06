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
