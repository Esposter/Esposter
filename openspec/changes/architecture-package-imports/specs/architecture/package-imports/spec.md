## ADDED Requirements

### Requirement: A package addresses its own source through its manifest

Every package, the web app included, SHALL reach its own modules through the subpath imports its manifest declares, so that Node, the bundlers, the test runner and the typecheck all resolve a specifier to the same file.

#### Scenario: A web app script run by bare Node

- **GIVEN** a script under the web app that imports modules from the app's source, its shared folder and its scripts folder
- **WHEN** a bare Node process runs it
- **THEN** every import resolves and the script runs

#### Scenario: Nuxt and Node resolving one name

- **GIVEN** a name that both Nuxt's aliases and the web app's manifest declare
- **WHEN** it is resolved through Nuxt's alias and through the manifest
- **THEN** both resolve to the same folder

#### Scenario: An alias import in the web app

- **GIVEN** a module in the web app that imports through `@/` or `@@/`
- **WHEN** the repository is linted
- **THEN** the lint fails on that import

### Requirement: Every TypeScript script runs under Node

A package script that runs a TypeScript file SHALL run it with Node alone, with no other loader.

#### Scenario: A script entry running TypeScript through another loader

- **GIVEN** a package script that runs a `.ts` file through `vpx`
- **WHEN** the package-scripts test runs
- **THEN** it fails naming that script
