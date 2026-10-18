## Purpose

The nightly release workflow, job by job — the one release job that versions, tags and publishes, the draft GitHub release, the host attachment and the gate that makes the release public.

## Requirements

### Requirement: Only the nightly release workflow publishes a release

Only the release workflow SHALL tag a release, publish packages to the registry and create a GitHub release.

#### Scenario: A release is made

- **GIVEN** a release is made
- **WHEN** it is tagged, published and drafted
- **THEN** the release workflow performs every one of those steps

### Requirement: A quiet night skips the release

The nightly release SHALL skip every later job when no commit has landed on main since the latest tag.

#### Scenario: The nightly run finds no new commit

- **GIVEN** no commit has landed on main since the latest tag
- **WHEN** the nightly run starts
- **THEN** the check finds nothing to release
- **AND** every later job is skipped

### Requirement: The version, tag, publish and draft happen in one job in that order

The version, the tag, the registry publish and the draft release SHALL happen in one release job, in that order, so a version reaches the registry only from the run that tagged it.

#### Scenario: The release job fails after pushing the version

- **GIVEN** the release job has pushed the version commit
- **WHEN** a later step of the job fails
- **THEN** the review run still merges main back into the queue
- **AND** the tag may exist without a release

#### Scenario: The release job fails before pushing

- **GIVEN** the release job fails before the version push
- **WHEN** the job ends
- **THEN** no review run starts
- **AND** no draft release is created

### Requirement: The release goes public only after the packages publish and the host attaches

A GitHub release SHALL become public only after its packages have reached the registry and the Windows host has been attached to its draft.

#### Scenario: Every package publishes and the host attaches

- **GIVEN** the release job succeeded and the host build succeeded
- **WHEN** the publish job runs
- **THEN** the draft release becomes public

#### Scenario: The host build fails

- **GIVEN** the host build fails
- **WHEN** the publish job is due to run
- **THEN** the draft release stays a draft

### Requirement: A re-run does not publish a version twice

A re-run of the release SHALL NOT publish a version the registry already has, and SHALL NOT attach a second host asset to a release that is already public.

#### Scenario: The release is already public

- **GIVEN** the release is already public
- **WHEN** the workflow is run again
- **THEN** no further host asset is attached
- **AND** no version is published a second time

### Requirement: A failed release is recovered from its existing tag

A failed release SHALL be recovered by dispatching the workflow with the existing tag, which publishes only the versions the registry lacks and does not bump any version again.

#### Scenario: A dispatch names an existing tag

- **GIVEN** a release failed after its tag was created
- **WHEN** the workflow is dispatched with that tag
- **THEN** only the package versions missing from the registry are published
- **AND** no version is bumped and no gate is rerun

#### Scenario: A quiet night follows a failed release

- **GIVEN** a release failed and no new commit has landed on main
- **WHEN** the nightly run starts
- **THEN** the failed release is not retried by that run
