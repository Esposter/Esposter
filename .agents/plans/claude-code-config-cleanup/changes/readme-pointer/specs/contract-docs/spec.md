## Purpose

The team setup is described in several files that agents read: the contract, the rules, the skills and the README. Each fact must live in exactly one of them, so a change edits one place and the others cannot drift from it.

## ADDED Requirements

### Requirement: Each fact has one owning file

A fact about the team setup SHALL be written in one owning file, and every other file that needs it SHALL point to that file rather than repeat it.

#### Scenario: Restated workflow is refused

- **GIVEN** the README containing a stage table that duplicates the `openspec` skill's stage mapping
- **WHEN** the documentation check runs
- **THEN** the check fails and names the duplicated table and its owning skill

#### Scenario: Pointer passes

- **GIVEN** the README listing the stages and naming the skill that owns them
- **WHEN** the documentation check runs
- **THEN** the check passes

### Requirement: Third-party notices stay complete

The repository SHALL keep the third-party notices and the MIT licence text verbatim in its README.

#### Scenario: Notices survive the reduction

- **GIVEN** the README after the reduction
- **WHEN** the documentation check runs
- **THEN** it contains the MIT licence text for both upstream projects
