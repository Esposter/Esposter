## Purpose

Every file a workspace package's build emits has its exact size committed in one record, so a change that moves a bundle shows its bytes in the diff, a shrink as plainly as a growth, and one workspace test holds the record to a fresh build.

## Requirements

### Requirement: The record holds the exact size of every built file

The record SHALL list every file each built workspace package emits with its size in bytes, and the workspace test SHALL fail when a fresh build differs from it in any file's size, or in the files present.

#### Scenario: the record is the size of every built file

- **GIVEN** a build of every workspace package
- **WHEN** the record is compared with the sizes that build produced
- **THEN** they are equal

#### Scenario: finds the built packages

- **GIVEN** a build of the workspace
- **WHEN** the record's reach is read
- **THEN** it covers at least one built package

### Requirement: A file whose bytes follow the checkout folder keeps its recorded size within a tolerance

A built file whose bytes depend on the folder the repository is checked out in SHALL be accepted at its recorded size when the build is within a small tolerance of it, and every other file SHALL be held to its exact size.

#### Scenario: a checkout-dependent file within the tolerance keeps its recorded size

- **GIVEN** a checkout-dependent file a few bytes from its recorded size
- **WHEN** the sizes are settled against the record
- **THEN** the file keeps its recorded size

#### Scenario: a checkout-dependent file past the tolerance is its built size

- **GIVEN** a checkout-dependent file far from its recorded size
- **WHEN** the sizes are settled against the record
- **THEN** the file is its built size

#### Scenario: any other file is its built size, however close

- **GIVEN** a file that is not checkout-dependent, one byte from its recorded size
- **WHEN** the sizes are settled against the record
- **THEN** the file is its built size
