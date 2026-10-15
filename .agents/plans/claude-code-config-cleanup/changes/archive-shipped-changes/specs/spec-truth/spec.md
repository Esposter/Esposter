## Purpose

`openspec/specs/` is the record of what the team setup does once a change has shipped. A capability whose change has merged but is still held in `openspec/changes/` has no record there, so `/spec` finds nothing to read. Archiving moves each merged change's requirements into that record.

## ADDED Requirements

### Requirement: Merged changes are archived into the specs

A change whose pull request has merged to `main` SHALL be archived, so that each requirement it added or modified is recorded under `openspec/specs/`.

#### Scenario: Merged change is archived

- **GIVEN** a change whose commits are on `main`
- **WHEN** the change is archived
- **THEN** its requirements appear under `openspec/specs/<capability>/spec.md`
- **AND** its folder moves to `openspec/changes/archive/`

#### Scenario: Unmerged change is not archived

- **GIVEN** a change whose commits are not yet on `main`
- **WHEN** the archive is requested
- **THEN** the archive is refused and the change stays in `openspec/changes/`

#### Scenario: Change that modifies an existing capability merges into it

- **GIVEN** two archived changes where the second modifies a capability the first created
- **WHEN** the second change is archived
- **THEN** the modified requirement replaces the earlier wording in `openspec/specs/`
