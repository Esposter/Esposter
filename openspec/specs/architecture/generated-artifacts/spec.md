## Purpose

Every file a script writes from another source lives under a generated/ folder in the package that consumes it, one file per entity unless the consumer reads the whole set at once, committed, cleared and rewritten by its generator and never edited by hand — and an authored file never holds a generated value, so what a person chose and what a tool derived are told apart by path alone.

## Requirements

### Requirement: A generated file lives in a generated folder of its consumer

Every file a script writes from another source SHALL live in a generated folder of the package that consumes it, one file per entity unless the consumer reads the whole set at once.

#### Scenario: A generator writes an entity file

- **GIVEN** a generator that writes one file per entity
- **WHEN** it runs
- **THEN** each entity's file sits in a generated folder of the consuming package
- **AND** the files are committed

#### Scenario: A consumer reads the whole set at once

- **GIVEN** a generated set that its consumer reads in one read
- **WHEN** the generator runs
- **THEN** the set is one file at the root of the generated folder

### Requirement: A generated file is never edited by hand

A generated file SHALL NOT be edited by hand, and each generator SHALL clear its folder and write it again on every run.

#### Scenario: A hand edit to a generated file

- **GIVEN** a generated file someone has edited by hand
- **WHEN** its generator runs again
- **THEN** the edit is overwritten

#### Scenario: An entity the source no longer holds

- **GIVEN** a generated folder holding a file for an entity the source has dropped
- **WHEN** the generator runs
- **THEN** that file is gone after the run

### Requirement: An authored file and a generated file never hold each other's values

An authored file SHALL NOT hold a generated value, and a generated file SHALL NOT hold an authored one.

#### Scenario: An authored reference and a generated measurement both exist

- **GIVEN** a character with an authored reference and a generated measurement
- **WHEN** the consumer reads the character's reference
- **THEN** the authored reference is used
- **AND** the generated measurement is used only when no authored reference exists

#### Scenario: The authored reference is deleted

- **GIVEN** a character whose authored reference has been deleted
- **WHEN** the generated measurement is regenerated
- **THEN** the measurement is used again
- **AND** the authored file is unchanged

### Requirement: A browser-fetched dataset is published with only its lock committed

A dataset that a browser fetches SHALL be published as content-addressed objects, with only a lock naming each object's hash committed to the repository.

#### Scenario: A browser reads a dataset

- **GIVEN** a dataset that a screen reads in the browser
- **WHEN** the dataset is generated
- **THEN** its objects are published to storage
- **AND** only the lock naming each object's hash is committed

### Requirement: A generated source file keeps the formatter's shape

A generated source file SHALL already be in the formatter's own shape, so that a re-run with unchanged data leaves the tree unchanged.

#### Scenario: A re-run with unchanged data

- **GIVEN** a generator whose data has not changed
- **WHEN** the generator runs again
- **THEN** the working tree has no changes

### Requirement: A regenerated folder is excluded from review

A regenerated generated folder SHALL NOT be shown to a reviewer, and its generator's change SHALL be reviewed on its own.

#### Scenario: A regeneration lands on the queue

- **GIVEN** a regeneration that changes files in a generated folder
- **WHEN** the review packs its windows
- **THEN** the generated folder is left out of the window
- **AND** the generator's own change is reviewed in full
