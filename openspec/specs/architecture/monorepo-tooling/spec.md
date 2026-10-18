## Purpose

pnpm workspace orchestration, publishing, installs, CI job shape under vp's traced task cache, and the lint over the workflows.

## Requirements

### Requirement: Selectors name the set they want

The workspace SHALL let every package selector address a set of packages, so that a library added later falls inside every selector without any selector being edited.

#### Scenario: A new library joins the workspace

- **GIVEN** the workspace already holds its libraries and applications
- **WHEN** a new library package is added to the library root
- **THEN** the workspace-wide build, lint, typecheck and test selectors include it
- **AND** no selector or configuration file names the new library

#### Scenario: A new application stays outside the library selectors

- **GIVEN** the workspace already holds its libraries and applications
- **WHEN** a new application is added to the application root
- **THEN** the library-only selectors exclude it

### Requirement: The bare build command builds the application

The bare build command SHALL build the application and the libraries it imports, and no other package.

#### Scenario: The deploy platform runs its default build

- **GIVEN** the deploy platform is configured with the default build command
- **WHEN** a deploy starts
- **THEN** the application and the libraries it imports are built in dependency order
- **AND** no unrelated package is built

### Requirement: Checks run concurrently and builds run in dependency order

Independent checks SHALL run concurrently across packages, and a package build SHALL start only after the builds it depends on have finished.

#### Scenario: Lint runs across every package

- **GIVEN** the workspace holds several packages with no dependency between them
- **WHEN** lint runs across all of them
- **THEN** the packages are checked concurrently

#### Scenario: A package builds after the packages it depends on

- **GIVEN** one library depends on another
- **WHEN** the libraries are built
- **THEN** the dependency finishes building before the library that uses it starts

### Requirement: Tests run as one suite over every project

The test and coverage commands SHALL run every test file in a single run, so that a sharded run covers each test file exactly once.

#### Scenario: Coverage runs in shards

- **GIVEN** coverage is split into several shards
- **WHEN** the coverage shards run
- **THEN** each test file runs in exactly one shard
- **AND** a merge step produces one coverage report from every shard without rerunning any test

#### Scenario: A shard fails on a test

- **GIVEN** a test fails inside one shard
- **WHEN** the shard finishes
- **THEN** its output names the failing test rather than only reporting where the coverage data was written

### Requirement: The shard count matches the required checks

The coverage shard count SHALL match the number of coverage checks that branch protection requires, so that no required check is left without a result.

#### Scenario: The shard count changes without the required checks

- **GIVEN** the coverage shard count has changed
- **WHEN** the required check list still names the old count
- **THEN** pull requests wait on a check that never reports
- **AND** the change that altered the count also updates the required check list

### Requirement: CI jobs run each tool through its root script

A CI job SHALL run each check through its root script with tool flags passed as direct arguments.

#### Scenario: A job passes a shard flag to coverage

- **GIVEN** a CI job runs the coverage script with a shard flag
- **WHEN** the job runs
- **THEN** the test tool receives the shard flag and runs only its slice

#### Scenario: Flags are written behind a separator

- **GIVEN** a job passes its flags after a separator in a script invocation
- **WHEN** the job runs
- **THEN** the flags are dropped and the run ignores them

### Requirement: A release runs every gate before it versions or publishes

A release SHALL run the format, build, lint, typecheck and test gates before it bumps any version, creates any tag or publishes any package.

#### Scenario: A gate fails during a release

- **GIVEN** the release is started
- **WHEN** any gate fails
- **THEN** no version is bumped, no tag is created and no package is published

#### Scenario: Every gate passes

- **GIVEN** the release is started
- **WHEN** every gate passes
- **THEN** the versions are bumped before any package is published

### Requirement: The nightly release publishes only reviewed main

The nightly release SHALL publish only commits that have landed on the main branch.

#### Scenario: No commit landed on main since the last release

- **GIVEN** no commit has landed on the main branch since the last release tag
- **WHEN** the nightly run starts
- **THEN** the release is skipped

#### Scenario: The version push to main is rejected

- **GIVEN** the nightly release has bumped the versions
- **WHEN** the push of the version commit and tag is rejected
- **THEN** the job fails before anything is published
- **AND** the next night versions from the current tip of main

### Requirement: Packages publish without a stored registry credential

Packages SHALL be published using the release job's own CI identity, with no long-lived registry token stored anywhere.

#### Scenario: A new version is published

- **GIVEN** a version is not yet on the registry
- **WHEN** the release job publishes it
- **THEN** it authenticates with its CI identity
- **AND** a public package carries a provenance attestation

#### Scenario: The registry publish fails

- **GIVEN** the release job has created its GitHub release as a draft
- **WHEN** the registry publish fails
- **THEN** the GitHub release stays a draft
- **AND** no public release names a version that did not publish

### Requirement: The node version is declared in one place

The repository SHALL declare its node version in a single file, and every consumer SHALL take it from that file.

#### Scenario: The node version is bumped

- **GIVEN** the update command is given a new node version
- **WHEN** it runs
- **THEN** the pinned node version and the matching type definitions move together
- **AND** no other file holds a copy of the version number

### Requirement: Workflow files are parsed before merge

Every workflow file SHALL pass a workflow linter as part of the lint check, so that a file the CI platform cannot parse fails the push that carried it.

#### Scenario: A push carries a workflow file the platform cannot parse

- **GIVEN** a push contains a workflow file the CI platform cannot parse
- **WHEN** the lint check runs on that push
- **THEN** the lint check fails

#### Scenario: A push carries only valid workflow files

- **GIVEN** a push contains only workflow files the CI platform can parse
- **WHEN** the lint check runs on that push
- **THEN** the workflow lint passes

### Requirement: Workflows use only allowed and pinned third-party actions

A workflow SHALL use only third-party actions the repository allows, and every third-party action SHALL be pinned to a full commit identifier.

#### Scenario: A workflow uses an action the repository does not allow

- **GIVEN** a workflow references a third-party action missing from the allowed list
- **WHEN** the workflow is started
- **THEN** the platform refuses the action and the workflow fails at startup with no job run

#### Scenario: A workflow references a third-party action

- **GIVEN** a workflow references a third-party action
- **WHEN** the reference is read
- **THEN** it names a full commit identifier followed by the version it stands for

### Requirement: Jobs declare narrow token permissions

Each CI job SHALL declare its token permissions explicitly and no broader than its own work needs.

#### Scenario: A read-only job checks out the code

- **GIVEN** a job only reads the repository
- **WHEN** it checks out the code
- **THEN** it does not persist its credentials
- **AND** its token holds read access to repository contents only

#### Scenario: A release job publishes

- **GIVEN** a release job publishes a version
- **WHEN** it runs
- **THEN** its token holds write access to repository contents for that job alone

### Requirement: Duplicate code fails the check

The duplicate-code check SHALL fail on any duplicated block that its scan reports within the scanned scopes.

#### Scenario: A block is duplicated within a scanned scope

- **GIVEN** a block of code is duplicated above the configured threshold within a scanned scope
- **WHEN** the duplicate-code check runs
- **THEN** the check fails

#### Scenario: No duplicated block is reported

- **GIVEN** no block of code is duplicated above the threshold
- **WHEN** the duplicate-code check runs
- **THEN** the check passes

### Requirement: Unchanged checks replay their recorded result

A check or build whose traced inputs are unchanged SHALL replay its recorded result rather than run again.

#### Scenario: A check re-runs on an unchanged tree

- **GIVEN** a saved result exists for inputs identical to the current tree
- **WHEN** the check runs again
- **THEN** the recorded result is replayed without running the tool

#### Scenario: A replayed build restored too little output

- **GIVEN** a replayed build restored fewer outputs than the build produced
- **WHEN** the verification step runs
- **THEN** it fails and names the package whose output is missing
