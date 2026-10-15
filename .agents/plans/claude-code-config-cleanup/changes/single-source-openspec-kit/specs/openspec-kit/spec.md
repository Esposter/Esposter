## Purpose

The OpenSpec kit ships to product repositories through a plugin and a setup command, so each shipped file must have one authored source that every other copy is checked against. This keeps a schema or lint edit from landing in one place and silently missing from another.

## ADDED Requirements

### Requirement: Each shipped OpenSpec file has one authored source

Every file the kit ships SHALL have exactly one authored source, and every other copy of it SHALL be derived from that source.

#### Scenario: Derived copy matches its source

- **GIVEN** the authored lint script and a derived copy in the repository
- **WHEN** the configuration check runs
- **THEN** the check passes only when the two files are byte-identical

#### Scenario: Edited derived copy is refused

- **GIVEN** a derived copy of the team schema edited by hand
- **WHEN** the configuration check runs
- **THEN** the check fails and names the derived file and its source

### Requirement: Setup copies the schema from the template

`/opsx-setup` SHALL write the team schema into a repository from the template, and SHALL NOT write a schema of its own.

#### Scenario: Setup writes the team schema

- **GIVEN** a repository without an `openspec/schemas/team-bdd` folder
- **WHEN** `/opsx-setup` runs in that repository
- **THEN** the folder is created with a byte-identical copy of the template schema

#### Scenario: Setup does not overwrite a customised schema

- **GIVEN** a repository whose `openspec/schemas/team-bdd` differs from the template
- **WHEN** `/opsx-setup` runs in that repository
- **THEN** the setup stops and reports the difference instead of overwriting it
