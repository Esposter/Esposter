## Purpose

How a workspace package that is a Nuxt module is laid out, built, registered, typed and tested — the module entry Nuxt loads at configuration time, the runtime directory Nuxt and Nitro bundle file by file, and why the app registers it by its source.

## Requirements

### Requirement: A workspace module installs on a fresh clone before any package is built

A workspace package that is a Nuxt module SHALL load during install before any package has been built, so that a fresh clone installs without a build.

#### Scenario: A fresh clone is installed

- **GIVEN** a clone has no built package output yet
- **WHEN** its dependencies are installed
- **THEN** the install completes
- **AND** the app's preparation step loads the module without error

#### Scenario: The app registers the module by its published name before a build

- **GIVEN** the app registers the module by its published package name
- **WHEN** a fresh clone is installed before any package is built
- **THEN** the install fails because the module's build output is missing

### Requirement: Each runtime file ships as its own file

A module's runtime SHALL be built one output per source file, so that a new runtime file is importable by its subpath without any export being added by hand.

#### Scenario: A new runtime file is added to the module

- **GIVEN** a new runtime file is added to the module
- **WHEN** the packages are built
- **THEN** a consumer imports the new file by its subpath
- **AND** no export list is edited by hand

### Requirement: Runtime files import only published framework packages

A module's runtime files SHALL import only published framework packages, and SHALL NOT import build-time virtual modules.

#### Scenario: A runtime file imports a build-time virtual module

- **GIVEN** a runtime file imports a virtual module that exists only inside a Nuxt build
- **WHEN** the typecheck or the tests run
- **THEN** they fail

#### Scenario: A runtime file imports a published framework package

- **GIVEN** a runtime file imports a published framework package
- **WHEN** the typecheck runs
- **THEN** the declarations resolve to their real types

### Requirement: The module registers its handlers and hooks for the app

A module SHALL register its own server handlers and runtime hooks, so that an app that adds the module writes no handler and no hook by hand.

#### Scenario: An app adds the module

- **GIVEN** an app adds the module to its configuration
- **WHEN** the server starts
- **THEN** the module's handlers are available without the app writing one
- **AND** the module's runtime hooks are typed for the app's server routes

### Requirement: Module composables are tested in a Nuxt fixture app

A module's composables SHALL be tested inside a Nuxt fixture app over the real data-fetching composable, and its server transports SHALL be tested with the same transport production uses.

#### Scenario: A composable is tested

- **GIVEN** a composable of the module is under test
- **WHEN** its suite runs
- **THEN** it runs inside the fixture app over the real data-fetching composable

#### Scenario: A server transport is tested

- **GIVEN** a server handler of the module is under test
- **WHEN** its suite runs
- **THEN** it runs on a real server with the same transport production uses

### Requirement: A module is named for its package

A module's `meta.name` SHALL be its package's name, declared once as a `MODULE_NAME` constant in the module's runtime constants and read from there, and a workspace check SHALL fail when the constant differs from the manifest's `name` or the module does not read it.

#### Scenario: A module's name drifts from its package's

- **GIVEN** a Nuxt module package whose `MODULE_NAME` no longer equals its manifest's `name`
- **WHEN** the workspace tests run
- **THEN** the check names the package and the two names

### Requirement: A module that builds a file is proven by a fixture build

A module that writes a file into the build SHALL be proven by building a fixture app once and reading the output back, and the build SHALL write nothing to stderr.

#### Scenario: The module's output is wrong

- **GIVEN** a fixture app that uses the module
- **WHEN** the fixture is built
- **THEN** the files the module wrote are read back and compared with what the module promises
- **AND** an import the bundler could not resolve fails the build test
