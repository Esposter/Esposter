## Purpose

Store-driven singleton dialogs — one mounted dialog per feature, targeted by a per-service dialog store, instead of one dialog per list item.

## Requirements

### Requirement: A dialog for a list item is mounted once per list

A dialog that acts on a list item SHALL be mounted once for the whole list and aimed at an item by the reader's action, never mounted inside each row.

#### Scenario: A delete action on one row of a long list

- **GIVEN** a list with many rows, each with a delete control
- **WHEN** the reader clicks the delete control on one row
- **THEN** the list's one confirmation dialog opens for that row

### Requirement: A dialog shows the item's live data and closes when the item is gone

A dialog for a list item SHALL show the item's current data, and SHALL close when the item leaves the list.

#### Scenario: The item is edited while its dialog is open

- **GIVEN** a dialog open for an item
- **WHEN** the item's data changes
- **THEN** the dialog shows the new data

#### Scenario: The item leaves the list while its dialog is open

- **GIVEN** a confirmation dialog open for a row
- **WHEN** a search, page turn or removal takes that row out of the list
- **THEN** the dialog closes
- **AND** the dialog does not reopen over the same row when the row returns

### Requirement: An edit dialog starts fresh for each item

An edit dialog SHALL start from a fresh copy of the item each time a different item is opened.

#### Scenario: Opening edit for a second row

- **GIVEN** an edit dialog that was opened for one row and then cancelled
- **WHEN** the reader opens edit for a different row
- **THEN** the form shows the second row's values rather than the first row's

### Requirement: A dialog left open by navigation does not reopen on return

A dialog left open when the reader navigates away SHALL NOT reopen when the reader returns to the page.

#### Scenario: Navigating away and back with a dialog open

- **GIVEN** a dialog open for an item
- **WHEN** the reader navigates away and then returns to the page
- **THEN** the dialog is closed

### Requirement: A multi-row delete confirms once for the rows still present

A delete of a selection of rows SHALL confirm once for all the selected rows that are still present, and SHALL close when none of them remain.

#### Scenario: Deleting several selected rows

- **GIVEN** several selected rows
- **WHEN** the reader deletes the selection
- **THEN** one confirmation covers every selected row still present

#### Scenario: A read removes every selected row

- **GIVEN** a confirmation open for a selection of rows
- **WHEN** a read removes every selected row from the list
- **THEN** the dialog closes
