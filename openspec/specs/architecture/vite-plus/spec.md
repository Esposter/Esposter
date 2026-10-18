## Purpose

What the task runner owns here — a traced task cache for the builds and the runtime and package-manager install — and what it deliberately does not, with every tool kept on the catalog's version and the framework owning the app build.

## Requirements

### Requirement: A cached task replays only when everything it read is unchanged

A cached task SHALL replay its recorded outputs only when every file its command read still matches the recorded run, and SHALL otherwise run its command again.

#### Scenario: An unchanged tree replays the recorded outputs

- **GIVEN** a cached task has a recorded run
- **WHEN** the task runs on a tree where nothing it read has changed
- **THEN** the recorded outputs are replayed
- **AND** the command does not run

#### Scenario: A changed file that the task read makes it run again

- **GIVEN** a cached task has a recorded run
- **WHEN** a file that run read has changed
- **THEN** the command runs again
- **AND** the new run is recorded

### Requirement: A command is cached only when a replay is as good as a run

A command SHALL run as a cached task only when its result depends solely on files the cache can see, it is slow enough that a replay saves real time, and it runs again on an unchanged tree, and every other command SHALL remain a plain script.

#### Scenario: A command run for its effect is never replayed

- **GIVEN** a command starts a dev server, releases, or rewrites files for a fresh reading
- **WHEN** the command is run
- **THEN** it runs every time
- **AND** no earlier result is replayed in its place

#### Scenario: A benchmark measures again instead of replaying

- **GIVEN** a benchmark command whose purpose is a new measurement
- **WHEN** it is run on an unchanged tree
- **THEN** it measures again
- **AND** no earlier measurement is replayed

#### Scenario: A command that reads the network or the clock stays a script

- **GIVEN** a command reads a git remote, the network or the clock
- **WHEN** it is run
- **THEN** it runs every time and is not cached

### Requirement: A command that needs caching is a task under its own name

A command that needs caching SHALL be a cached task under its own name, and no plain script SHALL share that name.

#### Scenario: A cached build and its plain script cannot share a name

- **GIVEN** a build is cached as a task
- **WHEN** the repository's command names are checked
- **THEN** the build's name resolves to the task
- **AND** no plain script of the same name exists

### Requirement: An aggregate check replays nothing of its own

An aggregate check SHALL run its leaves, and each cached leaf SHALL replay on its own inputs, with the aggregate holding no replayed verdict of its own.

#### Scenario: The whole-repository check on an unchanged tree replays each leaf

- **GIVEN** every leaf of the whole-repository check has a recorded run
- **WHEN** the check runs on an unchanged tree
- **THEN** each leaf replays its own recorded result
- **AND** the aggregate records no verdict that no leaf produced

### Requirement: The workspace type check runs again on every invocation

The workspace type check SHALL run again on every invocation rather than replay a recorded verdict.

#### Scenario: The type check on an unchanged source tree still runs

- **GIVEN** the app's generated types can change without a source edit
- **WHEN** the workspace type check runs on an unchanged source tree
- **THEN** the check runs again

### Requirement: Files a command rewrites are outputs, and a build that reads what it rewrites is refused

A cached task SHALL record the files its command rewrites as outputs, and the cache SHALL refuse a build that rewrites a file it also reads, naming that file.

#### Scenario: A build that rewrites one of its own inputs is refused by the cache

- **GIVEN** a build rewrites a file it also reads
- **WHEN** the build is set up as a cached task
- **THEN** the cache refuses it
- **AND** the refusal names the file

#### Scenario: A replay restores the files the task rewrites

- **GIVEN** a cached task rewrites some of its outputs
- **WHEN** the task is replayed
- **THEN** the rewritten outputs are restored

### Requirement: Generated package output travels with the cache

A package build's generated output SHALL travel with its cached task, so that a fresh checkout restoring the cache does not miss on files it lacks.

#### Scenario: A fresh checkout with the cache restored replays the package build

- **GIVEN** a fresh checkout restores the task cache
- **WHEN** the package build runs
- **THEN** the build replays its recorded result
- **AND** the build does not miss because a generated file is absent from the checkout

### Requirement: Every cached task misses after any edit to what it reads

Every cached task SHALL miss the cache after an edit to any file it reads, including a file created where the task looks for one, and SHALL be probed this way before it is trusted.

#### Scenario: A source edit, a content edit or a template edit each cause a miss

- **GIVEN** a cached task has a recorded run
- **WHEN** a source file, the content of a file, or a template file it read is edited
- **THEN** the cache misses
- **AND** the command runs again

#### Scenario: A file created where the task looks for one causes a miss

- **GIVEN** a cached task has a recorded run
- **WHEN** a file is created at a path the task looks for
- **THEN** the cache misses

#### Scenario: A new native tool is probed before a task caches it

- **GIVEN** a task runs a native tool not yet probed
- **WHEN** the task is set up to be cached
- **THEN** the tool is probed for the same misses before the task is trusted

### Requirement: Each tool resolves to one version through the shared catalog

Each lint, format, test and build tool SHALL resolve to exactly one version across the repository, held in the shared version catalog.

#### Scenario: A task runner release that depends on internals fails loudly

- **GIVEN** the task runner and a tool it depends on are at mismatched versions
- **WHEN** a cached task runs
- **THEN** the cached task fails with an error
- **AND** no stale result is replayed in its place

### Requirement: Every lint and format reader shares one configuration

Every lint and format reader SHALL read one shared configuration, so that a setting has one source.

#### Scenario: A lint or format run from the root or from the editor reads the same settings

- **GIVEN** a lint or format pass is started from the root, the editor or the pre-commit hook
- **WHEN** the pass runs
- **THEN** it reads the same settings as every other pass

### Requirement: The JavaScript runtime and package manager come from the repository's pins

The JavaScript runtime version and the package manager version SHALL be provisioned from the two version pins the repository keeps, in local work and in CI alike.

#### Scenario: A developer or CI run sets up the runtime from the pins

- **GIVEN** the repository keeps its runtime pin and its package manager pin
- **WHEN** a developer or a CI run sets up the toolchain
- **THEN** both versions resolve from those pins

### Requirement: The app's own commands and the test runner stay with their existing tools

The test runner and the app's own dev and build commands SHALL remain with their existing tools and SHALL NOT run through the task runner.

#### Scenario: The app builds through its framework's own build command

- **GIVEN** the app is built for deploy
- **WHEN** the build runs
- **THEN** it runs through the framework's own build command
- **AND** the tests run through their existing runner
