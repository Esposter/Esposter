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
