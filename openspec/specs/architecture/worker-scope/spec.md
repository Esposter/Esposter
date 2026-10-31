## Purpose

Every web worker and the service worker loads in a scope that has no `window`, no `document` and none of the globals only Node adds, so a worker that reads one as it evaluates never starts. The repository finds every worker entry by its name and runs it in such a scope, so a worker that cannot load is named without anyone listing it.

## Requirements

### Requirement: A worker evaluates in a scope without a window or Node

Every worker entry SHALL evaluate in a scope that has the globals a worker has and none that only a window or Node adds.

#### Scenario: A module a worker imports reads a Node global as it loads

- **GIVEN** a worker, or a module it imports at any depth, reads `process` as it evaluates
- **WHEN** the worker scope suite runs
- **THEN** the suite fails
- **AND** the failure names that worker's path

### Requirement: A worker is found by its name

A file named `*.worker.ts`, and the service worker at `service-worker/sw.ts`, SHALL be a worker entry, and no list of entries is kept.

#### Scenario: A new worker is covered without being listed

- **GIVEN** a `*.worker.ts` file is added anywhere in the repository, committed or not
- **WHEN** the worker scope suite runs
- **THEN** the suite evaluates that worker too

### Requirement: A shared clock reads no Node global

`now` from `@esposter/shared` SHALL read the platform's clock, and SHALL NOT read a global that a worker lacks, so a worker that imports the shared package evaluates.

#### Scenario: A worker imports the shared package

- **GIVEN** a worker imports `@esposter/shared`
- **WHEN** the worker evaluates in a scope without `process`
- **THEN** it evaluates
