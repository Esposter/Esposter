## Purpose

Defines how Esposter records specifications and design decisions as OpenSpec changes, how their scenarios are checked, and when a shipped change becomes part of the spec of record.

## ADDED Requirements

### Requirement: New specifications are OpenSpec changes

The repository SHALL hold each new specification and design decision as an OpenSpec change under `openspec/changes/<id>/`.

#### Scenario: A change folder is complete

- **WHEN** a non-trivial change is proposed
- **THEN** its folder holds a proposal, a spec delta, a design and a task list

#### Scenario: A change with no spec delta is refused

- **WHEN** `openspec validate <id> --strict --no-interactive` runs on a change that has a proposal and no spec delta
- **THEN** validation fails, unless the change sets `skip_specs` in its `.openspec.yaml`

### Requirement: Scenarios read as GIVEN WHEN THEN steps

Every scenario in every OpenSpec spec in the repository SHALL read as one optional GIVEN step, one WHEN step and one THEN step, with AND steps allowed after any of them.

#### Scenario: A scenario with no THEN step is refused

- **GIVEN** a spec whose scenario has a WHEN step and no THEN step
- **WHEN** the repository's tests run
- **THEN** the scenario check fails and names the scenario

#### Scenario: A scenario with prose in it is refused

- **GIVEN** a spec whose scenario has a sentence of prose between its steps
- **WHEN** the repository's tests run
- **THEN** the scenario check fails and names the line of prose

#### Scenario: A well-formed scenario passes

- **GIVEN** a spec whose scenarios read GIVEN, WHEN and THEN steps
- **WHEN** the repository's tests run
- **THEN** the scenario check passes

### Requirement: Shipped changes are merged into the spec of record

The repository SHALL merge a change's requirements into `openspec/specs/` only after the change's pull request has merged to main.

#### Scenario: A merged change is archived

- **WHEN** the change's pull request merges to main
- **THEN** archiving the change moves its folder into `openspec/changes/archive/` and updates `openspec/specs/`

#### Scenario: An open change stays in place

- **WHEN** the change's pull request is still open
- **THEN** its folder stays under `openspec/changes/` and `openspec/specs/` is unchanged
