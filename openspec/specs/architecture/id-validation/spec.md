# architecture/id-validation Specification

## Purpose

Every id a field holds is validated as a version-4 UUID, and every fixed id is built on the all-zero v4 so it passes that same check.

## Requirements

### Requirement: An id is validated as a v4

An id field SHALL be validated as a v4 UUID, and a fixed id SHALL be v4-shaped so that it passes that validation.

#### Scenario: A real id passes

- **GIVEN** an id minted by the database or by `crypto.randomUUID()`
- **WHEN** it reaches an id field's validator
- **THEN** it is accepted

#### Scenario: An id of another version is refused

- **GIVEN** an id whose version digit is not 4
- **WHEN** it reaches an id field's validator
- **THEN** it is refused

#### Scenario: A fixed id passes

- **GIVEN** a sentinel or a seeded id built on the all-zero v4
- **WHEN** it reaches an id field's validator
- **THEN** it is accepted, and the nil UUID is refused
