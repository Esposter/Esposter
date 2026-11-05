## Purpose

The release workflow `Release.yaml`: the nightly that ships `main`, the dispatch that finishes an unfinished tag at once, and the reusable finish it calls: the packages publish, the draft GitHub release and the gate that makes the release public.

## Requirements

### Requirement: Only the release workflow publishes a release

Only the release workflow SHALL tag a release, publish packages to the registry and create a GitHub release, and it SHALL do so through the one shared finish.

#### Scenario: A release is made

- **GIVEN** a release is made
- **WHEN** it is tagged, published and drafted
- **THEN** the release workflow performs every one of those steps through the shared finish

### Requirement: A quiet night skips the release

The nightly release SHALL skip every later job when no commit has landed on main since the latest tag and that tag's release is already finished.

#### Scenario: The nightly run finds no new commit

- **GIVEN** no commit has landed on main since the latest tag
- **AND** that tag's release is public
- **WHEN** the nightly run starts
- **THEN** the check finds nothing to release
- **AND** every later job is skipped

### Requirement: The version, tag, publish and draft happen in one order

The version, the tag, the registry publish and the draft release SHALL happen in that order, so a version reaches the registry only from the run that tagged it.

#### Scenario: The release job fails after pushing the version

- **GIVEN** the nightly release job has pushed the version commit
- **WHEN** a later step of the job fails
- **THEN** the review run still merges main back into the queue
- **AND** the tag may exist without a release until a later run finishes it

#### Scenario: The release job fails before pushing

- **GIVEN** the nightly release job fails before the version push
- **WHEN** the job ends
- **THEN** no review run starts
- **AND** no draft release is created

### Requirement: The release goes public only after the packages publish

A GitHub release SHALL become public only after its packages have reached the registry.

#### Scenario: Every package publishes

- **GIVEN** the packages published
- **WHEN** the publish job runs
- **THEN** the draft release becomes public

#### Scenario: A package fails to publish

- **GIVEN** a package fails to publish
- **WHEN** the publish job is due to run
- **THEN** the draft release stays a draft

### Requirement: A re-run does not publish a version twice

A re-run of the finish SHALL NOT publish a version the registry already has.

#### Scenario: The release is already public

- **GIVEN** the release is already public
- **WHEN** the finish is run again
- **THEN** no version is published a second time

### Requirement: A tag whose release is unfinished is finished before anything new ships

The nightly SHALL finish the latest tag first when that tag's GitHub release is missing or still a draft, and SHALL NOT release a new version that night.

#### Scenario: The night after a failed release

- **GIVEN** a release failed after its tag was created
- **WHEN** the nightly run starts
- **THEN** the run finishes that tag, publishing only the versions the registry lacks
- **AND** no version is bumped and no gate is rerun
- **AND** no new version is released that night

### Requirement: A dispatch finishes an unfinished tag at once

A dispatch of the release workflow SHALL finish the latest tag when its GitHub release is missing or still a draft, without waiting for the nightly.

#### Scenario: A dispatch finds an unfinished tag

- **GIVEN** the latest tag's GitHub release is still a draft
- **WHEN** the release workflow is dispatched
- **THEN** the run finishes that tag through the shared finish
- **AND** no version is bumped
