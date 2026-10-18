## Purpose

CSV/JSON/XLSX files as resources — identity, parse settings, and grid data split into their proper homes with Data and Settings blades.

## Requirements

### Requirement: CSV, JSON and XLSX files import as sheets

An owner SHALL be able to import a CSV, JSON or XLSX file as a sheet resource.

#### Scenario: Owner imports a CSV file

- **GIVEN** the owner has a sheet resource
- **WHEN** the owner imports a CSV file into it
- **THEN** the sheet shows the file's rows

### Requirement: An import previews the first five rows

An import SHALL show the first five rows of the file as a preview.

#### Scenario: Owner chooses a file to import

- **GIVEN** the owner has chosen a file to import
- **WHEN** the import is parsed
- **THEN** the first five rows are shown as a preview

### Requirement: Importing the same file again leaves the sheet unchanged

Importing the same file again SHALL leave the stored sheet unchanged.

#### Scenario: Owner imports an unchanged file twice

- **GIVEN** a sheet was imported from a file
- **WHEN** the owner imports the same file again
- **THEN** the sheet's data is the same as before

### Requirement: Changing file settings does not change existing data

Changing the file settings SHALL NOT change the data already in the sheet until the file is imported again.

#### Scenario: Owner changes the delimiter

- **GIVEN** a CSV sheet has data
- **WHEN** the owner changes its delimiter in Settings
- **THEN** the data in the sheet is unchanged

### Requirement: Each sheet can be exported in the three formats

Every sheet SHALL offer export in CSV, JSON and XLSX.

#### Scenario: Owner exports a sheet

- **GIVEN** a sheet has data
- **WHEN** the owner exports it
- **THEN** the owner can choose CSV, JSON or XLSX

### Requirement: A sheet over the content size limit is refused before saving

A sheet larger than the content size limit SHALL be refused before it is saved, with a notice that names its size and the limit.

#### Scenario: Import larger than the limit

- **GIVEN** a file is larger than the content size limit
- **WHEN** the owner imports it
- **THEN** the import is refused
- **AND** a notice names the file's size and the limit

### Requirement: An empty sheet points to the import command

A sheet with no rows SHALL show an empty state pointing the owner to the import command.

#### Scenario: New sheet

- **GIVEN** a sheet has been created and not imported
- **WHEN** the owner opens it
- **THEN** an empty state points to Import

### Requirement: Other resources can read a sheet as a data source

A sheet SHALL be available to other resources as a data source, offering its whole table as one item.

#### Scenario: Dashboard binds a sheet

- **GIVEN** a dashboard is configured to use a sheet
- **WHEN** the dashboard reads its data
- **THEN** the whole sheet is available as one item

### Requirement: Data and Settings are separate blades

A sheet SHALL offer a Data blade for editing its rows and a Settings blade for its file type and parse options.

#### Scenario: Owner switches blades

- **GIVEN** a sheet is open
- **WHEN** the owner switches between Data and Settings
- **THEN** Data shows the grid of rows
- **AND** Settings shows the file type and its parse options
