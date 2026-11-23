## Purpose

Oxlint over every script, vize over every component template and the workspace tests over what no linter reads, with the rules that keep each file in one pass, where a ban is written, and the type-aware behaviour lint depends on.

## Requirements

### Requirement: Each file is checked by the pass that reads it, and each rule by one pass only

Every file SHALL be checked by the pass that can read it, and no rule SHALL run in more than one pass.

#### Scenario: A component's script and template

- **GIVEN** a single-file component
- **WHEN** lint runs
- **THEN** oxlint checks its script block
- **AND** vize checks its template

#### Scenario: A file no linter reads

- **GIVEN** a JSON file or a template directive comment
- **WHEN** the repository is checked
- **THEN** a workspace test checks the file

#### Scenario: A rule the fast pass runs

- **GIVEN** a rule the fast pass runs
- **WHEN** lint runs over a file that breaks it
- **THEN** the finding is reported once

#### Scenario: A template rule

- **GIVEN** a rule over a component's template
- **WHEN** lint runs over a template that breaks it
- **THEN** the finding is reported once, by the pass that reads templates

### Requirement: A ban no linter will ever express is recorded as permanent

A ban that no linter can express SHALL be recorded as permanent, so that no audit re-derives it.

#### Scenario: A ban no linter will ever express

- **GIVEN** a ban that no linter will ever ship a rule for
- **WHEN** the ban is recorded
- **THEN** it is noted as permanent

### Requirement: The type-aware rules run in routine lint

The type-aware rules SHALL run in routine lint, and what they report SHALL fail it.

#### Scenario: Routine lint

- **GIVEN** a change to lint
- **WHEN** routine lint runs
- **THEN** the type-aware rules run
- **AND** each one reports at `error`

#### Scenario: An unhandled promise

- **GIVEN** an unhandled promise committed
- **WHEN** routine lint runs
- **THEN** the promise is reported

### Requirement: A deprecated library call fails lint on every run

A call to an API its library has marked deprecated SHALL fail lint on every run.

#### Scenario: Code calls a deprecated engine API

- **GIVEN** code that calls an API its library has marked deprecated
- **WHEN** lint runs
- **THEN** the call is reported before it is committed

### Requirement: Plugin mod folders are linted without the rule that queries their overloads

The plugin mod folders SHALL be linted without the type-aware rule that queries their overloads, while every other rule still runs there.

#### Scenario: Linting a plugin mod folder

- **GIVEN** a plugin mod folder with async hooks
- **WHEN** lint runs over it
- **THEN** the overload rule does not run there
- **AND** every other rule still applies

### Requirement: Bundled HTML element data records the standard it was crawled from

A bundled copy of the HTML element data SHALL record the release and the standard date it was crawled from.

#### Scenario: The element data is refreshed

- **GIVEN** the bundled element data is due for a refresh
- **WHEN** it is refreshed
- **THEN** the standard is crawled again
- **AND** the recorded release and date are updated

### Requirement: The whole repository is linted in one run

The repository's lint SHALL cover every package in one run, oxlint over the scripts and vize over the templates side by side.

#### Scenario: Linting the whole repository

- **GIVEN** a checkout of the whole repository
- **WHEN** lint runs over everything
- **THEN** the fast pass covers every package
- **AND** it finishes in under a minute

#### Scenario: A component's template is linted

- **GIVEN** a single-file component whose template breaks a template rule
- **WHEN** lint runs
- **THEN** the finding is reported
- **AND** no rule reads the component's script twice

### Requirement: A ban is written in the first host a planted violation proves

A ban SHALL be written in the first mechanism that a planted violation shows can express it.

#### Scenario: Choosing the mechanism for a ban

- **GIVEN** a candidate ban
- **WHEN** a planted violation is run through the candidate mechanism
- **THEN** the mechanism reports the violation
- **AND** that mechanism is chosen

#### Scenario: A selector ban the plugin cannot run

- **GIVEN** a selector ban whose selector the selector plugin cannot match
- **WHEN** its planted violation is run
- **THEN** the violation is not reported
- **AND** the ban is written as a visitor in the same plugin instead

### Requirement: Lint runs without the classic TypeScript compiler installed

The lint SHALL run every rule with no classic TypeScript compiler installed in the workspace.

#### Scenario: Linting a workspace with no classic compiler

- **GIVEN** a fresh install of the workspace
- **WHEN** lint runs over everything
- **THEN** every rule runs
- **AND** no lint step loads the classic TypeScript compiler

#### Scenario: A lint tool that needs the classic compiler

- **GIVEN** a lint tool added that loads the classic TypeScript compiler
- **WHEN** lint runs
- **THEN** the lint fails
- **AND** the failure names the compiler it could not load

### Requirement: Manifests and JSON files are checked without a linter

Every tracked JSON file and package manifest SHALL be checked for validity and for banned dependencies by the workspace checks.

#### Scenario: A manifest names a banned dependency

- **GIVEN** a package manifest that lists a dependency with a recorded replacement
- **WHEN** the workspace checks run
- **THEN** they fail
- **AND** the failure names the dependency and its replacement

#### Scenario: A JSON file holds a duplicate key

- **GIVEN** a tracked JSON file with the same key twice in one object
- **WHEN** the workspace checks run
- **THEN** they fail
- **AND** the failure names the file and the key
