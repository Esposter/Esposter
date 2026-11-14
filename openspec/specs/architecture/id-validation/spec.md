# architecture/id-validation Specification

## Purpose

Every id a field holds is validated as a version-7 UUID, every id is minted by one generator, and every fixed id is built on the all-zero v7 so it passes that same check.

## Requirements

### Requirement: An id is validated as a v7

An id field SHALL be validated as a v7 UUID, and a fixed id SHALL be v7-shaped so that it passes that validation. The Claude Code session id a todo's origin carries is the one exception: Claude Code mints it in the v4 layout, so its field validates a v4.

#### Scenario: A real id passes

- **GIVEN** an id minted by `v7` from the `uuid` package
- **WHEN** it reaches an id field's validator
- **THEN** it is accepted

#### Scenario: An id of another version is refused

- **GIVEN** an id whose version digit is not 7
- **WHEN** it reaches an id field's validator
- **THEN** it is refused

#### Scenario: A fixed id passes

- **GIVEN** a sentinel or a seeded id built on the all-zero v7
- **WHEN** it reaches an id field's validator
- **THEN** it is accepted, and the nil UUID is refused

### Requirement: An id is minted by one generator

An id SHALL be minted by `v7` from the `uuid` package. `crypto.randomUUID()` and `uuid`'s `v4` SHALL NOT be used to mint an id, and lint SHALL report either.

#### Scenario: A v4 generator is reported

- **GIVEN** a call to `crypto.randomUUID()` or an import of `v4` from `uuid`
- **WHEN** the lint runs
- **THEN** it is reported, with a pointer to `v7`
