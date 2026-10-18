## Purpose

Excel-style cell range selection with keyboard copy/paste — TSV + HTML copy, overwrite and shift-down paste modes, fully undoable.

## Requirements

### Requirement: Copy places the range on the clipboard as text and as a table

Copying a selected range SHALL place it on the clipboard as tab-separated text and as an HTML table.

#### Scenario: Pasting a copied range into a spreadsheet

- **GIVEN** a range of cells is selected
- **WHEN** the owner presses Ctrl+C and pastes into another spreadsheet
- **THEN** the rows and columns keep their structure

#### Scenario: Browser cannot write the table form

- **GIVEN** the browser cannot write the HTML form of the clipboard
- **WHEN** the owner copies a range
- **THEN** the range is still copied as tab-separated text

### Requirement: Copy excludes hidden columns and follows the header toggle

Copy SHALL exclude hidden columns, and SHALL include the header row only when the header toggle is on.

#### Scenario: Hidden column is not copied

- **GIVEN** a column in the selected range is hidden
- **WHEN** the owner copies the range
- **THEN** the hidden column is not included

#### Scenario: Header row included when the toggle is on

- **GIVEN** the copy-with-headers toggle is on
- **WHEN** the owner copies a range
- **THEN** the copied text begins with the header row

### Requirement: Copy writes the displayed value of computed cells

Copy SHALL write the displayed value of each computed cell in the range.

#### Scenario: Range includes a computed column

- **GIVEN** the selected range includes a computed column
- **WHEN** the owner copies the range
- **THEN** the computed cells carry their displayed values

### Requirement: Ctrl+V overwrites cells from the selection's top-left cell

Ctrl+V SHALL overwrite cells in place starting at the top-left cell of the selection, add rows past the last row, and ignore columns past the last column.

#### Scenario: Paste past the last row

- **GIVEN** the pasted text has more rows than remain below the selection
- **WHEN** the owner presses Ctrl+V
- **THEN** the cells are overwritten from the selection's top-left cell
- **AND** rows past the last row are added

#### Scenario: Paste past the last column

- **GIVEN** the pasted text has more columns than remain to the right
- **WHEN** the owner presses Ctrl+V
- **THEN** the extra columns are ignored

### Requirement: Ctrl+Shift+V inserts rows and pushes existing rows down

Ctrl+Shift+V SHALL insert the pasted rows at the anchor row, pushing existing rows down.

#### Scenario: Shift-down paste

- **GIVEN** the anchor is on row three
- **WHEN** the owner presses Ctrl+Shift+V with two pasted rows
- **THEN** two new rows are inserted at row three
- **AND** the existing rows from row three move down

### Requirement: Pasted text is converted to each column's type

Pasted text SHALL be converted to the type of the column it lands in.

#### Scenario: Pasting numbers into a number column

- **GIVEN** a number column is the paste target
- **WHEN** the owner pastes the text 42
- **THEN** the cell holds the number 42

### Requirement: Pasting over a computed cell changes nothing

Pasting over a computed cell SHALL change nothing in that cell.

#### Scenario: Paste onto a computed column

- **GIVEN** a computed column is in the paste range
- **WHEN** the owner pastes over it
- **THEN** the computed cells are unchanged

### Requirement: Every paste can be undone and redone

Every paste SHALL be undoable and redoable, restoring overwritten cells and removing rows the paste added.

#### Scenario: Undo an overwrite paste

- **GIVEN** the owner has pasted over cells that added rows
- **WHEN** the owner undoes the paste
- **THEN** the overwritten cells return to their earlier values
- **AND** the rows the paste added are removed

#### Scenario: Undo a shift-down paste

- **GIVEN** the owner has pasted rows with shift-down
- **WHEN** the owner undoes the paste
- **THEN** the inserted rows are removed

### Requirement: Mouse and keyboard select cell ranges

A click SHALL select one cell, Shift+click SHALL extend the selection from the anchor cell, and dragging SHALL extend the selection while the mouse is held.

#### Scenario: Shift+click extends the selection

- **GIVEN** a cell is selected
- **WHEN** the owner Shift+clicks another cell
- **THEN** the selection covers the cells between them

#### Scenario: Escape clears the selection

- **GIVEN** a range is selected
- **WHEN** the owner presses Escape
- **THEN** no cells are selected

### Requirement: Arrow keys move the active cell and select it

Plain arrow keys SHALL move the active cell and select the cell they land on, and Shift+arrow keys SHALL extend the selection while keeping its anchor.

#### Scenario: Shift+arrow extends the selection

- **GIVEN** a cell is selected as the anchor
- **WHEN** the owner presses Shift and the down arrow
- **THEN** the selection extends one row down from the anchor

### Requirement: Clipboard keys act only while cells are selected

Copy and paste SHALL act on the grid only while cells are selected, and SHALL NOT act while a text field has focus.

#### Scenario: Copy with no cells selected

- **GIVEN** no grid cells are selected
- **WHEN** the owner presses Ctrl+C
- **THEN** the page's own copy action runs

#### Scenario: Typing in a field

- **GIVEN** the owner is typing in a text field
- **WHEN** the owner presses Ctrl+V
- **THEN** the grid does not paste
