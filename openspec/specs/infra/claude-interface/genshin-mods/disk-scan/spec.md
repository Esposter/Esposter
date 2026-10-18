## Purpose

A refusal, before a Bash command runs, of any command that scans the disk from a root or a home folder — find, du, grep -r and ls -R over /, a drive, or ~ — and names the known place each file lives instead.

## Requirements

### Requirement: A Bash scan from a drive root or a home folder is refused

A Bash command SHALL be refused when a find, du, grep or ls recursion would scan from a drive root or a home folder.

#### Scenario: Finding files from a drive root

- **GIVEN** a Bash command running find from a drive root
- **WHEN** it is requested
- **THEN** it is refused before it runs

#### Scenario: A recursive listing of the home folder

- **GIVEN** a Bash command running ls with recursion over the home folder
- **WHEN** it is requested
- **THEN** it is refused before it runs

#### Scenario: A recursive grep from a root

- **GIVEN** a Bash command running grep recursively with a root as its path
- **WHEN** it is requested
- **THEN** it is refused before it runs

### Requirement: A refusal names the known place each file lives

A refused command SHALL be denied with a message naming the known place each kind of file lives.

#### Scenario: A refused search for a model package

- **GIVEN** a refused scan looking for a package
- **WHEN** the denial is shown
- **THEN** it names the place the package is resolved from

### Requirement: Scans from folders that are not roots run unchanged

A scan from a folder that is neither a root nor a home folder SHALL run as it always did.

#### Scenario: Finding files inside the repository

- **GIVEN** a find over a folder inside the repository
- **WHEN** it is requested
- **THEN** it runs

### Requirement: A root named as data is not a scan

A root named as data, such as a commit message or a grep pattern, SHALL NOT count as a scan.

#### Scenario: A root inside a commit message

- **GIVEN** a commit command whose message names a root
- **WHEN** it is requested
- **THEN** it runs

### Requirement: Commands passed to a shell are read as well

The guard SHALL read a command passed to a shell or inside a command substitution as it reads a command typed directly.

#### Scenario: A scan wrapped in a shell command

- **GIVEN** a Bash command running a scan from a root inside a quoted shell command
- **WHEN** it is requested
- **THEN** it is refused before it runs

### Requirement: The guard cannot be switched off by a command

The guard SHALL NOT be switchable by any command and SHALL refuse in every session where the plugin is enabled.

#### Scenario: Attempting to disable the guard

- **GIVEN** a session where the plugin is enabled
- **WHEN** a command tries to turn the guard off
- **THEN** the guard stays on

### Requirement: The guard covers Bash only

The guard SHALL read Bash commands and SHALL NOT read PowerShell commands.

#### Scenario: A recursive PowerShell listing of a drive

- **GIVEN** a PowerShell command listing a drive recursively
- **WHEN** it is requested
- **THEN** the guard does not refuse it

### Requirement: A scan the guard misses is stopped by the machine watcher

A scan that escapes the guard and burns half a minute of CPU SHALL be stopped by the machine watcher.

#### Scenario: An orphaned find that has used half a minute of CPU

- **GIVEN** an orphaned find, du, grep or rg process
- **WHEN** it has used half a minute of CPU time
- **THEN** the machine watcher stops it
