## Purpose

What a third-party package must earn to stay in the catalog — the three real costs, the admission gate, the stop list, the register and score that track every entry, and the absorption flow that replaces a package with one of our own.

## Requirements

### Requirement: A package is kept only after the admission gate finds no cheaper replacement

A third-party package SHALL be kept only after the admission gate finds no platform, installed or utility replacement for it.

#### Scenario: An unused package is removed

- **GIVEN** nothing in the repository imports or runs a catalog package
- **WHEN** the catalog is reviewed
- **THEN** the package is removed

#### Scenario: A package the platform already provides is replaced by the platform

- **GIVEN** the platform already does what a catalog package does
- **WHEN** the catalog is reviewed
- **THEN** the package is replaced by the platform's own capability

#### Scenario: A small utility with no feed is absorbed into our own code

- **GIVEN** a small utility is a catalog package with no upstream feed worth keeping
- **WHEN** the catalog is reviewed
- **THEN** its code moves into the shared package
- **AND** the catalog entry is removed

### Requirement: Engines, SDKs, the framework, tooling and accessibility-shaped packages stay packages

Engines, cloud and framework SDKs, build tooling, and packages whose real surface is focus management or keyboard semantics SHALL stay packages whatever their size or number of call sites.

#### Scenario: A large engine stays a package despite a good absorb score

- **GIVEN** an engine scores well on how sensibly it could be absorbed
- **WHEN** its verdict is recorded
- **THEN** it stays a package

#### Scenario: An accessibility-shaped package stays a package

- **GIVEN** a package's real surface is focus management and keyboard semantics
- **WHEN** its verdict is recorded
- **THEN** it stays a package

### Requirement: A security-shaped or data-tracking package is absorbed only with its feed replaced

A security-shaped or data-tracking package SHALL be absorbed only when its upstream feed is replaced by a watch or a generator.

#### Scenario: A security-shaped absorption watches its advisories

- **GIVEN** a security-shaped package is being absorbed
- **WHEN** the absorption is complete
- **THEN** every in-scope defect and advisory has a regression test
- **AND** a watch on the upstream advisories starts a session to port each new fix

#### Scenario: A data-tracking absorption regenerates from the registry source

- **GIVEN** a data-tracking package is being absorbed
- **WHEN** the registry's source changes
- **THEN** the replacement is regenerated from that source

#### Scenario: A security-shaped package with no replacement feed stays a package

- **GIVEN** a security-shaped package has no replacement feed
- **WHEN** its verdict is recorded
- **THEN** it stays a package

### Requirement: An absorbed adapter reaches parity with the package it replaces

An absorbed adapter SHALL reach feature parity with the package it replaces and close every issue within its scope.

#### Scenario: A feature the app does not call is still implemented

- **GIVEN** the replaced package offers a feature the app does not call
- **WHEN** the adapter is absorbed
- **THEN** the replacement implements that feature as well

#### Scenario: A deprecated shape is not carried over

- **GIVEN** the replaced package offers a shape its engine has deprecated
- **WHEN** the adapter is absorbed
- **THEN** the replacement carries only the current shapes

### Requirement: Every upstream issue receives an evidenced verdict before the absorption is built

Every issue in the replaced package's tracker, open or closed, SHALL receive one verdict backed by evidence before the absorption is built.

#### Scenario: A reproduced defect is fixed and covered by a named regression test

- **GIVEN** an upstream issue describes a defect in the package
- **WHEN** the issue is triaged
- **THEN** the defect is reproduced, fixed, and covered by a regression test that names the issue

#### Scenario: A defect in a neighbouring dependency is out of scope

- **GIVEN** an upstream issue's behaviour lives in a dependency on either side of the adapter
- **WHEN** the issue is triaged
- **THEN** the verdict names the owner of that behaviour
- **AND** no regression test is claimed for it

#### Scenario: A question or duplicate is a false positive with its evidence linked

- **GIVEN** an upstream issue is a usage question or a duplicate
- **WHEN** the issue is triaged
- **THEN** the verdict says which it is
- **AND** links the evidence

### Requirement: A catalog entry is removed in the change that removes its last import

A catalog entry SHALL be removed in the same change that removes its last import.

#### Scenario: The last import removed takes its entry with it

- **GIVEN** the last import of a catalog package is removed
- **WHEN** the change lands
- **THEN** the package's catalog entry is removed in the same change

#### Scenario: A package kept against advice is listed as an exception

- **GIVEN** a package is kept against the enforcer's advice
- **WHEN** the lint check runs
- **THEN** the package is listed as an allowed exception with its reason

### Requirement: A replacement is built behind the call site it replaces

A replacement SHALL be built behind the call site it replaces, so that the swap and its reversal each take one import change.

#### Scenario: The swap is one import change and its revert is one import change

- **GIVEN** a replacement is ready behind its call site
- **WHEN** the replacement is swapped in
- **THEN** the swap is a single import change
- **AND** reverting it is also a single import change

### Requirement: Workarounds forced by a replaced package are removed with it

Every workaround a replaced package forced on the app SHALL be removed or given its real reason in the change that drops the package.

#### Scenario: A workaround citing the replaced package is deleted or explained

- **GIVEN** a workaround in the app cites the replaced package's tracker
- **WHEN** the package is dropped
- **THEN** the workaround is deleted or its real reason is written in its place
