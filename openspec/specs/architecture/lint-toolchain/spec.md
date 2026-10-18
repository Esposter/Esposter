## Purpose

Oxlint as the one repo-wide pass with ESLint behind it for what oxlint cannot parse, the config that keeps the two from double-linting, where the type-aware pass spends its time, and the blocker table a bump is read against.

## Requirements

### Requirement: Lint runs as one fast pass with a second pass for what it cannot parse

The repository's lint SHALL run as one fast pass over every package, with a second pass used only for the files the fast pass cannot parse.

#### Scenario: Linting the whole repository

- **GIVEN** a checkout of the whole repository
- **WHEN** lint runs over everything
- **THEN** the fast pass covers every package
- **AND** it finishes in under a minute

#### Scenario: A file the fast pass cannot parse

- **GIVEN** a single-file component or a JSON file
- **WHEN** lint runs
- **THEN** the second pass checks the file

### Requirement: Each rule is run by one pass only

Each rule SHALL be run by exactly one pass, so that no file is checked twice for the same rule.

#### Scenario: A rule category run by the fast pass

- **GIVEN** a rule category the fast pass runs
- **WHEN** lint runs
- **THEN** the second pass does not run its copies of those rules

#### Scenario: A ban moved to the fast pass

- **GIVEN** a ban previously written in the second pass
- **WHEN** the ban is moved into the fast pass's configuration
- **THEN** the second pass's copy of the rule is disabled

### Requirement: A ban is written in the first mechanism a planted violation proves

A ban SHALL be written in the first mechanism that a planted violation shows can express it.

#### Scenario: Choosing the mechanism for a ban

- **GIVEN** a candidate ban
- **WHEN** a planted violation is run through the candidate mechanism
- **THEN** the mechanism reports the violation
- **AND** that mechanism is chosen

#### Scenario: A ban that exists only in the second pass

- **GIVEN** a ban written only in the second pass's configuration
- **WHEN** the fast pass ships a rule with the same name
- **THEN** the ban goes silent
- **AND** the ban must be written in the fast pass's configuration to stay in force

### Requirement: The five costliest type-aware rules run on a periodic pass

The five costliest type-aware rules SHALL NOT run in routine lint and SHALL run on a periodic pass that fixes what they report.

#### Scenario: Routine lint

- **GIVEN** a change to lint
- **WHEN** routine lint runs
- **THEN** the five costliest type-aware rules do not run

#### Scenario: The periodic pass

- **GIVEN** the periodic pass is due
- **WHEN** it runs
- **THEN** the five rules are enabled
- **AND** what they report is fixed
- **AND** the rules are turned off again

#### Scenario: An unhandled promise between periodic passes

- **GIVEN** an unhandled promise committed between periodic passes
- **WHEN** routine lint runs
- **THEN** the promise is not reported

### Requirement: A deprecated library call fails lint on every run

A call to an API its library has marked deprecated SHALL fail lint on every run.

#### Scenario: Code calls a deprecated engine API

- **GIVEN** code that calls an API its library has marked deprecated
- **WHEN** lint runs
- **THEN** the call is reported before it is committed

### Requirement: Plugin mod folders are linted without the rules that query their overloads

The plugin mod folders SHALL be linted without the two type-aware rules that query their overloads, while every other rule still runs there.

#### Scenario: Linting a plugin mod folder

- **GIVEN** a plugin mod folder with async hooks
- **WHEN** lint runs over it
- **THEN** lint completes in about a second
- **AND** every other rule still applies

### Requirement: A rule left in the second pass names its trigger or is recorded as permanent

A rule that stays in the second pass SHALL name the upstream trigger that would move it, or be recorded as permanent.

#### Scenario: A rule waiting on an upstream gap

- **GIVEN** a rule the fast pass does not yet implement
- **WHEN** the toolchain is bumped
- **THEN** the blocker table names the trigger to check for that rule

#### Scenario: A ban no linter will ever express

- **GIVEN** a ban that no linter will ever ship a rule for
- **WHEN** the ban is recorded
- **THEN** it is noted as permanent so that no audit re-derives it

### Requirement: A toolchain bump moves rules it newly covers out of the second pass

A toolchain bump SHALL move each rule it newly covers out of the second pass without an edit to the repository's configuration.

#### Scenario: A bump adds coverage for a rule

- **GIVEN** a toolchain bump that adds coverage for a rule
- **WHEN** lint runs after the bump
- **THEN** the second pass no longer runs that rule

### Requirement: Bundled HTML element data records the standard it was crawled from

A bundled copy of the HTML element data SHALL record the release and the standard date it was crawled from.

#### Scenario: The element data is refreshed

- **GIVEN** the bundled element data is due for a refresh
- **WHEN** it is refreshed
- **THEN** the standard is crawled again
- **AND** the recorded release and date are updated
