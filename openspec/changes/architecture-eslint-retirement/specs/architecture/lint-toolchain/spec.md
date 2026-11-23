## REMOVED Requirements

### Requirement: Lint runs as one fast pass with a second pass for what it cannot parse

**Reason**: The second pass was ESLint, for templates, JSON and selector bans. Templates move to vize, JSON to workspace checks and selector bans into oxlint.

**Migration**: "Lint runs as one fast pass with a template pass beside it only where needed".

### Requirement: Each rule is run by one pass only

**Reason**: Two passes shared rules only because ESLint ran beside oxlint behind a bridge. The passes now split by what they read.

**Migration**: "Each rule is run by one host only".

### Requirement: A ban is written in the first mechanism a planted violation proves

**Reason**: Its second scenario described a ban silenced when ESLint's copy was bridged off, which no longer happens.

**Migration**: "A ban is written in the first host a planted violation proves".

### Requirement: A toolchain bump moves rules it newly covers out of the second pass

**Reason**: The rule overlap this described came from ESLint running beside oxlint, with a bridge switching off ESLint's copies. With ESLint gone, no two passes share a rule, so there is nothing to move.

**Migration**: None. A rule oxlint newly ships is configured like any other.

## ADDED Requirements

### Requirement: Lint runs as one fast pass with a template pass beside it only where needed

The repository's lint SHALL run as one fast pass over every package, with a second pass used only for the templates of single-file components when the fast pass cannot report a finding on its template line.

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

### Requirement: Each rule is run by one host only

Each rule SHALL be run by exactly one pass, so that no file is checked twice for the same rule.

#### Scenario: A rule the fast pass runs

- **GIVEN** a rule the fast pass runs
- **WHEN** lint runs over a file that breaks it
- **THEN** the finding is reported once

#### Scenario: A template rule

- **GIVEN** a rule over a component's template
- **WHEN** lint runs over a template that breaks it
- **THEN** the finding is reported once, by the pass that reads templates

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

### Requirement: A template finding is reported on its template line

A finding in a component's template SHALL be reported on the template line that holds it.

#### Scenario: A finding in a script-first component

- **GIVEN** a component whose script comes before its template
- **WHEN** lint runs over a template line that breaks a rule
- **THEN** the finding is reported on that template line

#### Scenario: A finding in a component with no script

- **GIVEN** a component with a template and no script block
- **WHEN** lint runs over a template line that breaks a rule
- **THEN** the finding is reported on that template line

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
