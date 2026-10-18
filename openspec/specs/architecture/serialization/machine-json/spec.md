## Purpose

Why machine-written JSON whose string fields are paths parses plainly through one named helper per package, never revived from string shape.

## Requirements

### Requirement: Path fields in machine-written files stay as text

A path field in a machine-written file SHALL be read as text, so that a path that happens to look like a timestamp never fails the read.

#### Scenario: A cached file name that looks like a timestamp

- **GIVEN** a machine-written cache entry whose file path is a timestamp-shaped name
- **WHEN** the cache entry is read
- **THEN** the read succeeds
- **AND** the path is kept as text

#### Scenario: A failing read after a command has run

- **GIVEN** a command that has already written its files and then reads a machine-written file
- **WHEN** that read would reject a path
- **THEN** the files the command already wrote are not discarded

### Requirement: Each package reads its machine-written files through one named helper

Each package SHALL read its machine-written files through one named parsing helper, so that the exception to date handling is declared in one place.

#### Scenario: A new machine-written file is read

- **GIVEN** a package that reads a new machine-written file
- **WHEN** the change is reviewed
- **THEN** the file is read through the package's shared parsing helper
