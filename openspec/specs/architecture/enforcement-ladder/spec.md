## Purpose

How a rule that must hold everywhere is made to hold — by construction, then one primitive, then lint, then a test, and prose in a skill or page only when nothing above it can.

## Requirements

### Requirement: A rule is enforced on the highest rung that can carry it

A rule that must hold in many places SHALL be placed on the highest rung that can carry it, with prose used only when no rung above can.

#### Scenario: Types make the wrong version unwritable

- **GIVEN** a rule that a change to the shape of a type can enforce
- **WHEN** the type is changed so the wrong version cannot be written
- **THEN** no lint rule or test is added for that rule

#### Scenario: One primitive owns the job

- **GIVEN** a job that one primitive can own
- **WHEN** a new caller needs that job
- **THEN** the caller passes its data through the primitive

#### Scenario: Lint for a violation visible in one file

- **GIVEN** a violation visible in one file's syntax with no list of exceptions
- **WHEN** a file with the violation is checked
- **THEN** the lint fails it, including files added after the rule was written

#### Scenario: A test for what lint cannot see

- **GIVEN** a wrong version that one file's syntax cannot show
- **WHEN** the test for that rule runs against the wrong version
- **THEN** the test fails

#### Scenario: Prose only as the last rung

- **GIVEN** a rule that no rung above can make fail on the wrong version
- **WHEN** the rule is recorded
- **THEN** it is written into its owning skill and spec

### Requirement: A missing guard is fixed by changing the shape

When a defect is one call site missing its guard, the fix SHALL change the shape so that every call site is covered, landed in the same change as the defect fix.

#### Scenario: A new control inside a clickable row

- **GIVEN** a clickable row that contains controls
- **WHEN** a new control is added inside the row with no extra wiring
- **THEN** a click on that control does not also activate the row

### Requirement: A lint rule carries no roster of exceptions

A lint rule SHALL NOT name its exceptions as a list of paths, helper names or suffixes.

#### Scenario: A rule that would need an exception list

- **GIVEN** a proposed lint rule that can only be stated with a list of paths or names to skip
- **WHEN** the rule is proposed
- **THEN** the rule is kept on a lower rung and the list is not added

#### Scenario: A new file within a rule's scope

- **GIVEN** a lint rule already in force
- **WHEN** a new file that falls within its scope is added
- **THEN** the rule applies to the new file with no edit to the rule

### Requirement: A finding written twice is handed to an enforcer

A class of problem reported in two places SHALL be handed to an enforcer rather than written up a third time.

#### Scenario: A repeated finding

- **GIVEN** a review or sweep has reported the same class of problem in two places
- **WHEN** the same class is found again
- **THEN** an enforcer is added for it
- **AND** the finding stops being written as prose

### Requirement: An enforcer goes with the shape it guards

Deleting a guarded shape SHALL delete its lint rule or test in the same change.

#### Scenario: A guarded shape is deleted

- **GIVEN** a shape guarded by a lint rule or a test
- **WHEN** the shape is deleted
- **THEN** its lint rule or test is deleted in the same change
