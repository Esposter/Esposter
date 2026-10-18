## Purpose

Why resource content is read with plain JSON.parse and its date fields coerced by the content schema, never revived from string shape.

## Requirements

### Requirement: Resource content dates are converted by the content schema only

Resource content SHALL be read as stored text, and its date fields SHALL be converted to dates by the content's own schema, never by guessing from the shape of a text value.

#### Scenario: A sheet cell holding text that looks like a date

- **GIVEN** a sheet cell into which the reader typed text that looks like a date
- **WHEN** the sheet is read
- **THEN** the cell stays text
- **AND** the sheet reads as present

#### Scenario: Text revived as a date by shape

- **GIVEN** a cell whose text would be turned into a date by shape alone
- **WHEN** the resource is read
- **THEN** the whole resource fails to read, not just the one cell

### Requirement: Local drafts follow the same rule

Local drafts SHALL be read under the same rule, so that a draft body which is itself date-like text stays text.

#### Scenario: A draft whose body is date-like text

- **GIVEN** a local draft whose body is text that looks like a date
- **WHEN** the draft is restored
- **THEN** its body stays text
