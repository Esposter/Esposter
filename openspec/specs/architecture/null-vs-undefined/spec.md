## Purpose

App-owned code has one absent-value form — undefined, or a domain sentinel like "" — and null survives only inside external boundary shapes.

## Requirements

### Requirement: App-owned code expresses absence with one form

App-owned code SHALL express absence with a domain sentinel where one exists and with undefined otherwise, and SHALL NOT write null.

#### Scenario: A string field has no value

- **GIVEN** an app-owned string field has no value
- **WHEN** the field is read or saved
- **THEN** it holds the empty string sentinel rather than null

#### Scenario: A lookup finds nothing

- **GIVEN** a lookup in app-owned code finds no entry
- **WHEN** the result is returned
- **THEN** the result is undefined

### Requirement: External shapes keep their null where they arrive

A null that an external system or the browser defines SHALL stay in the shape that system gives it, with no conversion layer between the boundary and the app.

#### Scenario: An external payload carries a null member

- **GIVEN** an external system's payload has a member it sends as null
- **WHEN** the app receives the payload
- **THEN** the member keeps its null value
- **AND** the app converts it to its own absent form only where the surrounding code needs that form

#### Scenario: A browser lookup finds no element

- **GIVEN** a browser lookup returns no element
- **WHEN** the caller checks the result
- **THEN** the caller treats the missing result as absent at that call site

### Requirement: An empty spreadsheet cell is distinct from an empty string

A spreadsheet cell that is empty SHALL be stored as null, and a cell holding the empty string SHALL be stored as the empty string, and the two SHALL sort, filter and count apart.

#### Scenario: A sheet holds an empty cell and a cell with the empty string

- **GIVEN** a sheet has one empty cell and one cell holding the empty string
- **WHEN** the sheet is sorted, filtered or counted
- **THEN** the empty cell and the cell holding the empty string are treated as different values

### Requirement: A pending read is reported by a flag, not a sentinel

A read that has not finished loading SHALL report that state through its pending flag, and a read that finished with no row SHALL report undefined.

#### Scenario: A read is still loading

- **GIVEN** a read has been started and has not answered yet
- **WHEN** the screen renders
- **THEN** the form that depends on the read is not shown

#### Scenario: A read finished with no row

- **GIVEN** a read has answered and found no row
- **WHEN** the screen renders
- **THEN** the form that depends on the read is shown
- **AND** the read's value is undefined
