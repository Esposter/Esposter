# architecture/ci-caches Specification

## Purpose

Which CI runs save a cache and which only read one: the default branch and ai/queue save, every other branch restores the newest cache it can see, and each save is made under a content key so it happens only once per key. The pnpm store is not cached.

## Requirements

### Requirement: A cache is saved only from the default branch and ai/queue

Every CI cache save SHALL run only on a workflow run of the default branch or of ai/queue. A run on any other branch SHALL restore the newest cache it can see and SHALL save no task cache or game data mirror.

#### Scenario: a run on ai/queue saves its caches

- **GIVEN** a run whose branch is `ai/queue` and whose cache key is missing
- **WHEN** the run's cache save step is reached
- **THEN** the cache is saved under that key

#### Scenario: a run on another branch restores without saving

- **GIVEN** a run whose branch is a Renovate or pull request branch
- **WHEN** the run reaches a cache save step
- **THEN** no task cache or mirror is saved
- **AND** the run's restore reads the newest cache from its own branch or the default branch

### Requirement: The pnpm store is not cached

No workflow or action SHALL restore or save the pnpm store, by the setup action's own cache or by a step of its own. Every job SHALL install what it selects from the registry.

#### Scenario: a job installs without a restored store

- **GIVEN** a job that runs pnpm
- **WHEN** its install step runs
- **THEN** it fetches the selected projects' packages from the registry
- **AND** no store is restored before it or saved after it

#### Scenario: the setup step does not cache for itself

- **GIVEN** a workflow that sets up pnpm
- **WHEN** the setup step is configured
- **THEN** its `cache` option is not enabled

### Requirement: The game data mirror is filled and saved only from the saving branches

Every branch SHALL restore the newest game data mirror it can see. Only the default branch and ai/queue SHALL fill a missing mirror and save it under its lock's key, before the coverage shards start.

#### Scenario: a branch that cannot save restores the newest mirror

- **GIVEN** a run on a branch that is neither the default branch nor `ai/queue`
- **WHEN** the mirror's exact key is missing
- **THEN** the newest mirror it can see is restored
- **AND** the run fills and saves nothing

#### Scenario: ai/queue fills and saves a mirror its lock lacks

- **GIVEN** a run on `ai/queue` whose lock's key has no saved mirror
- **WHEN** the build packages job runs
- **THEN** the mirror is filled and saved under the lock's key before any coverage shard restores it

### Requirement: The cache rule is held by a test

The workflows and composite actions SHALL be checked by a test that fails when a cache save runs outside the saving branches or when the combined cache action is used.

#### Scenario: a cache save outside the saving branches fails the test

- **GIVEN** a workflow step that saves a cache without the saving-branch condition
- **WHEN** the workspace test runs
- **THEN** the test fails and names the file
