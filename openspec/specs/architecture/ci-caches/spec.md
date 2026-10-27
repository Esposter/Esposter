# architecture/ci-caches Specification

## Purpose

Which CI runs save a cache and which only read one: the default branch and ai/queue save, every other branch restores the newest cache it can see, and each save is made under a content key so it happens only once per key.

## Requirements

### Requirement: A cache is saved only from the default branch and ai/queue

Every CI cache save SHALL run only on a workflow run of the default branch or of ai/queue. A run on any other branch SHALL restore the newest cache it can see and SHALL save none.

#### Scenario: a run on ai/queue saves its caches

- **GIVEN** a run whose branch is `ai/queue` and whose cache key is missing
- **WHEN** the run's cache save step is reached
- **THEN** the cache is saved under that key

#### Scenario: a run on another branch restores without saving

- **GIVEN** a run whose branch is a Renovate or pull request branch
- **WHEN** the run reaches a cache save step
- **THEN** no cache is saved
- **AND** the run's restore reads the newest cache from its own branch or the default branch

### Requirement: The pnpm store is saved only when its lockfile key is missing

The pnpm store SHALL be keyed on the contents of the lockfile, and SHALL be saved after an install only when no store exists under that exact key.

#### Scenario: an unchanged lockfile saves nothing

- **GIVEN** a store already saved under the current lockfile's key
- **WHEN** a run restores that key and installs
- **THEN** no store is saved

#### Scenario: a changed lockfile saves a store under its new key

- **GIVEN** a lockfile whose key has no saved store
- **WHEN** a run on `ai/queue` installs
- **THEN** the store is saved under that key

### Requirement: The pnpm store's own per-run cache is off

No workflow or action SHALL enable the pnpm store's own cache, since that cache saves a store under a key unique to each run.

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

The workflows and composite actions SHALL be checked by a test that fails when a cache save runs outside the saving branches, or when the combined cache action is used.

#### Scenario: a cache save outside the saving branches fails the test

- **GIVEN** a workflow step that saves a cache without the saving-branch condition
- **WHEN** the workspace test runs
- **THEN** the test fails and names the file
