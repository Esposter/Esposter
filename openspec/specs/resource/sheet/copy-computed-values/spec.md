## Purpose

Excel-style range copy materializes computed-column values instead of yielding empty cells.

## Requirements

### Requirement: Copying a range writes the displayed value of computed cells

Copying a range SHALL write the displayed value of each computed cell, never an empty cell.

#### Scenario: Copy range with a computed column

- **GIVEN** a range includes a computed column showing 80
- **WHEN** the owner copies the range
- **THEN** the pasted cell contains 80

### Requirement: Copied values do not depend on whether a source column is hidden

Copying a range SHALL give the same values whether or not the source column of a computed column is hidden.

#### Scenario: Source column hidden

- **GIVEN** the source column of a computed column is hidden
- **WHEN** the owner copies the computed column
- **THEN** the copied value is the same as when the source column is shown

### Requirement: A copied computed cell matches what the grid shows

A computed cell in a copied range SHALL copy the value the grid shows for it, including an empty value for a cycle.

#### Scenario: Cycle in a copied range

- **GIVEN** a computed column is part of a cycle and shows an empty cell
- **WHEN** the owner copies a range containing it
- **THEN** the copied cell is empty

### Requirement: Pasting onto a computed column changes nothing

Pasting onto a computed column SHALL change nothing, and the copied value SHALL land where it is pasted elsewhere.

#### Scenario: Paste onto a computed cell

- **GIVEN** the owner has copied a computed value
- **WHEN** the owner pastes onto a computed cell
- **THEN** the computed cell does not change

### Requirement: An aggregation copied from a small range uses every row

An aggregation copied from a small range SHALL be computed over every row of the sheet.

#### Scenario: Copying a single aggregated cell

- **GIVEN** a sheet has an average column
- **WHEN** the owner copies one cell from it
- **THEN** the copied value is the average over every row of the sheet
