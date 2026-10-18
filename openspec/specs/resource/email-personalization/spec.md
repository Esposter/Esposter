## Purpose

Merge-field blocks bound to a dataset, survey invite blocks, and per-row personalized HTML export from the email editor. The personalized export is built entirely in the browser and is one download; sending email is not part of it.

## Requirements

### Requirement: An email can be bound to a dataset for merge fields

The email author SHALL be able to bind an email to one dataset, after which each of its columns is available as a merge-field block.

#### Scenario: Binding a dataset offers its columns as merge fields

- **GIVEN** the author binds an email to a sheet with a name column
- **WHEN** they open the block manager
- **THEN** a merge-field block for the name column is available

#### Scenario: Dragging a merge field inserts its token

- **GIVEN** a merge-field block is available
- **WHEN** the author drags it into the email
- **THEN** the email shows the column's token in place

### Requirement: Survey invites can be added as buttons

The email author SHALL be able to add a button that invites recipients to one of their published surveys.

#### Scenario: A published survey appears as an invite block

- **GIVEN** the author has a published survey
- **WHEN** they open the block manager
- **THEN** an invite block for that survey is available

### Requirement: Personalized export produces one file per row

The export SHALL produce one HTML file per dataset row, with each row's merge fields filled in.

#### Scenario: Each row gets its own file

- **GIVEN** an email bound to a dataset with three rows
- **WHEN** the author exports personalized HTML
- **THEN** a download holds three HTML files
- **AND** each file shows that row's values in the merge fields

#### Scenario: The export is one download

- **GIVEN** the author starts a personalized export
- **WHEN** it finishes
- **THEN** all files arrive in a single download

### Requirement: Merge values cannot inject markup

The export SHALL escape each merge value, so that a value containing markup is shown as text.

#### Scenario: A value with markup is shown as text

- **GIVEN** a row's value contains angle brackets
- **WHEN** the author exports personalized HTML
- **THEN** the value shows its characters as text in the file

#### Scenario: A value with an ampersand is filled correctly

- **GIVEN** a column named "P&L" is used as a merge field
- **WHEN** the author exports personalized HTML
- **THEN** that merge field is filled with its row's value

### Requirement: A truncated audience is confirmed before export

The export SHALL ask the author to confirm before it personalizes a capped dataset, and SHALL NOT export silently.

#### Scenario: A capped audience is confirmed first

- **GIVEN** the bound dataset has more rows than the export reads
- **WHEN** the author starts a personalized export
- **THEN** the author is asked to confirm before any file is made

### Requirement: Exported images keep the owner's session dependency

The export SHALL keep images pointing at the owner's own asset addresses, so that they show only when opened while signed in.

#### Scenario: An exported image is blank outside the signed-in session

- **GIVEN** an exported file contains an image from the owner's assets
- **WHEN** the file is opened from disk
- **THEN** the image is blank
