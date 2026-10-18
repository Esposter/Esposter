## Purpose

Column formats render every cell, global search matches the rendered text, and sorting stays on the underlying value.

## Requirements

### Requirement: A formatted column displays every cell in its format

A column with a format SHALL display every cell in that format.

#### Scenario: Currency column

- **GIVEN** a currency column holds the value 9
- **WHEN** the sheet is shown
- **THEN** the cell reads $9.00

### Requirement: Editing a formatted cell shows the underlying value

Editing a formatted cell SHALL show and edit the underlying value rather than the formatted text.

#### Scenario: Owner edits a currency cell

- **GIVEN** a currency cell displays $1,234.00
- **WHEN** the owner opens the cell for editing
- **THEN** the editor shows 1234

### Requirement: Global search matches the text a cell displays

Global search SHALL match the text each cell displays, including its format.

#### Scenario: Searching with separators

- **GIVEN** a currency cell displays $1,234.00
- **WHEN** the owner searches for 1,234
- **THEN** that cell matches

### Requirement: Sorting compares the underlying values

Sorting SHALL compare the underlying values of cells, so numbers sort by magnitude.

#### Scenario: Sorting numbers

- **GIVEN** a currency column holds 10 and 9
- **WHEN** the owner sorts the column ascending
- **THEN** 9 comes before 10

### Requirement: Booleans and empty cells sort first

Sorting SHALL put boolean false before true, and empty cells before filled cells.

#### Scenario: Sorting booleans and empties

- **GIVEN** a column holds true, false and an empty cell
- **WHEN** the owner sorts the column ascending
- **THEN** false comes first
- **AND** the empty cell comes before true

### Requirement: Find and replace matches underlying values

Find and replace SHALL match underlying values rather than formatted text.

#### Scenario: Searching for the formatted text

- **GIVEN** a currency cell displays $1,234.00
- **WHEN** the owner finds 1,234 with find and replace
- **THEN** that cell does not match

#### Scenario: Searching for the underlying value

- **GIVEN** a currency cell holds 1234
- **WHEN** the owner finds and replaces 1234
- **THEN** that cell is updated

### Requirement: Column filters apply to underlying values

Per-column filters SHALL apply to underlying values rather than to the displayed text.

#### Scenario: Filtering a currency column

- **GIVEN** a currency column holds 1234
- **WHEN** the owner filters it for values above 1000
- **THEN** that row is kept
