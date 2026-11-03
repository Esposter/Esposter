## Purpose

Every issue and pull request on the upstream trackers of the Nuxt module the package replaces and of its engine, open and closed, with its verdict and evidence, so that no upstream item reaches the package's code undecided.

## Requirements

### Requirement: Every upstream item is audited before the package's code is written

The audit SHALL cover every issue and pull request on each upstream tracker, open and closed, before code for the package is written.

#### Scenario: Package code waits for a complete audit

- **GIVEN** the upstream trackers hold issues and pull requests, open and closed
- **WHEN** code for the package is about to be written
- **THEN** every one of those items already has a recorded verdict

#### Scenario: An item without a verdict holds back its code

- **GIVEN** an upstream item with no recorded verdict
- **WHEN** code for the behaviour the item describes is about to be written
- **THEN** that code is not written until the item has a verdict

### Requirement: Each upstream item carries exactly one verdict for each side it concerns

Each upstream item SHALL carry exactly one verdict from the set of already fixed, not applicable, in-scope defect, in-scope feature, out of scope, feature declined, false positive or support, and unclear, for each side of the package it concerns.

#### Scenario: A verdict outside the set is refused

- **GIVEN** an upstream item recorded with a verdict that is not in the set
- **WHEN** the audit is checked
- **THEN** the record is refused and the item keeps no verdict until one from the set is recorded

#### Scenario: A pull request that closes an issue carries its own verdict

- **GIVEN** a pull request that closes an upstream issue
- **WHEN** the audit records the pull request
- **THEN** the pull request carries its own verdict, and its evidence names the issue it closes

### Requirement: Every pull request is listed with its own verdict

Every pull request on each upstream tracker SHALL be listed with its own verdict, including a pull request that changes nothing the package ships.

#### Scenario: A pull request that changes nothing the package ships is listed with its reason

- **GIVEN** a pull request that changes no behaviour the package ships, such as a release, a dependency bump or a documentation edit
- **WHEN** the audit lists it
- **THEN** it carries a not applicable verdict that names that reason

### Requirement: Each verdict names the evidence it rests on

Each verdict SHALL name its evidence, which is the item's thread, a pull request, a source line or a reproduction.

#### Scenario: A verdict without evidence is refused

- **GIVEN** an upstream item whose verdict names no comment, pull request, source line or reproduction
- **WHEN** the audit is checked
- **THEN** the verdict is refused and the item is recorded as unclear until its evidence is named

### Requirement: An in-scope defect is reproduced by a regression test that fails upstream first

An in-scope defect SHALL be reproduced by a regression test whose title names the upstream issue, and the test fails against the upstream package before it passes against the package.

#### Scenario: A regression test that fails upstream and passes here reproduces the defect

- **GIVEN** a regression test written for an in-scope defect
- **WHEN** the test runs against the upstream package and then against this package
- **THEN** it fails against the upstream package and passes against this package

#### Scenario: A regression test that passes upstream does not reproduce the defect

- **GIVEN** a regression test written for an in-scope defect
- **WHEN** the test passes against the upstream package
- **THEN** the item is not an in-scope defect, and its verdict is re-decided as already fixed, false positive or support, or unclear

### Requirement: An item split between the package and a neighbour gets a verdict for each side

An upstream item whose defect sits partly in the package and partly in a neighbouring package SHALL carry a verdict for each side, and each verdict SHALL name the side it covers.

#### Scenario: A split item is recorded on both sides

- **GIVEN** an upstream item whose defect sits in the package and in a neighbouring package
- **WHEN** the audit records the item
- **THEN** the package side and the neighbour side each carry a verdict, and each verdict names its side

### Requirement: An out-of-scope or feature-declined verdict names its owner or its reason

Each out-of-scope or feature-declined verdict SHALL name the owner that holds the behaviour or the reason the package keeps the feature out.

#### Scenario: An out-of-scope verdict that names no owner is refused

- **GIVEN** an upstream item recorded as out of scope that names no owner
- **WHEN** the audit is checked
- **THEN** the verdict is refused and the item is recorded as unclear until an owner is named

### Requirement: A feature request is built only when it meets the audit bar

A feature request SHALL be built only when the absorbed module already offers it or the app needs it, and only when it is cheap to build and fits the package's shape.

#### Scenario: A feature the module offers, that is cheap and fits, is recorded as in scope

- **GIVEN** a feature request the absorbed module offers, that is cheap to build and fits the package's shape
- **WHEN** the request is triaged
- **THEN** it is recorded as an in-scope feature

#### Scenario: A feature the module does not offer and the app does not need is declined

- **GIVEN** a feature request the absorbed module does not offer and the app does not need
- **WHEN** the request is triaged
- **THEN** it is recorded as feature declined with its reason

### Requirement: An unclear item names the step that would settle it

An unclear item SHALL name the step that would settle it, such as a maintainer answer or a reproduction.

#### Scenario: An unclear item holds back its code

- **GIVEN** an upstream item recorded as unclear
- **WHEN** code for the behaviour the item describes is considered
- **THEN** no code is written for it until the named step settles its verdict
