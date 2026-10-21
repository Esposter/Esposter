## Purpose

The release workflows: the nightly that ships `main`, the tag-triggered recovery that finishes a tag as soon as it is pushed, and the reusable finish both call: the packages publish, the draft GitHub release, the host attachment and the gate that makes the release public.

## Requirements

### Requirement: Only the release workflows publish a release

Only the release workflows SHALL tag a release, publish packages to the registry and create a GitHub release, and the nightly and the tag-triggered recovery SHALL share the one finish that does so.

#### Scenario: A release is made

- **GIVEN** a release is made
- **WHEN** it is tagged, published and drafted
- **THEN** the nightly release workflow or the tag-triggered recovery performs every one of those steps through the shared finish

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

### Requirement: The release goes public only after the packages publish and the host attaches

A GitHub release SHALL become public only after its packages have reached the registry and the Windows host has been attached to its draft.

#### Scenario: Every package publishes and the host attaches

- **GIVEN** the packages published and the host build succeeded
- **WHEN** the publish job runs
- **THEN** the draft release becomes public

#### Scenario: The host build fails

- **GIVEN** the host build fails
- **WHEN** the publish job is due to run
- **THEN** the draft release stays a draft

### Requirement: A re-run does not publish a version twice

A re-run of the finish SHALL NOT publish a version the registry already has, and SHALL NOT attach a second host asset to a release that is already public.

#### Scenario: The release is already public

- **GIVEN** the release is already public
- **WHEN** the finish is run again
- **THEN** no further host asset is attached
- **AND** no version is published a second time

### Requirement: A tag whose release is unfinished is finished before anything new ships

The nightly SHALL finish the latest tag first when that tag's GitHub release is missing or still a draft, and SHALL NOT release a new version that night.

#### Scenario: The night after a failed release

- **GIVEN** a release failed after its tag was created
- **WHEN** the nightly run starts
- **THEN** the run finishes that tag, publishing only the versions the registry lacks
- **AND** no version is bumped and no gate is rerun
- **AND** no new version is released that night

### Requirement: A pushed version tag is finished as soon as it is pushed

A version tag SHALL be finished by the tag-triggered recovery when it is pushed, and a dispatch SHALL finish a named tag the same way.

#### Scenario: A tag is pushed

- **GIVEN** a `v*.*.*` tag is pushed
- **WHEN** the tag-triggered recovery starts
- **THEN** it finishes that tag through the shared finish
- **AND** it waits behind any nightly run holding the release group

#### Scenario: A dispatch names a tag

- **GIVEN** a version tag whose release is unfinished
- **WHEN** the recovery is dispatched with that tag
- **THEN** it finishes that tag through the shared finish
