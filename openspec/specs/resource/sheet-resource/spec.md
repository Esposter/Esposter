## Purpose

CSV/JSON/XLSX/XML files as resources — identity, parse settings, and grid data split into their proper homes with Data and Settings blades.

## Requirements

### Requirement: CSV, JSON, XLSX and XML files import as sheets

An owner SHALL be able to import a CSV, JSON, XLSX or XML file as a sheet resource.

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

### Requirement: Each sheet can be exported in the four formats

Every sheet SHALL offer export in CSV, JSON, XLSX and XML.

#### Scenario: Owner exports a sheet

- **GIVEN** a sheet has data
- **WHEN** the owner exports it
- **THEN** the owner can choose CSV, JSON, XLSX or XML

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

### Requirement: An XML file imports as a sheet

An owner SHALL be able to import an XML file as a sheet. The import SHALL read the first repeated child of the root as the row element, each such child as a row, each child element of a row as a cell of the column it is named, and each attribute of a row as a cell after them. A column's name SHALL be the element's name, or the name attribute of a `cell` element.

#### Scenario: Rows and cells are read

- **GIVEN** an XML file whose root holds two `row` elements, each with two child elements
- **WHEN** the owner imports it
- **THEN** the sheet has the child names as its columns and two rows

#### Scenario: A column first seen in a later row is a column

- **GIVEN** an XML file whose second row has a child the first has not
- **WHEN** the owner imports it
- **THEN** the sheet has that child's name as a column, empty in the first row

#### Scenario: A cell named by attribute keeps its name

- **GIVEN** an XML file with a `cell` element whose `name` attribute is a name with a space
- **WHEN** the owner imports it
- **THEN** the sheet has a column with that name

#### Scenario: A row's attributes are read as cells

- **GIVEN** an XML file whose rows carry an `id` attribute
- **WHEN** the owner imports it
- **THEN** the sheet has an `id` column holding each row's attribute

### Requirement: An XML file that cannot be read as rows is refused

The import SHALL refuse a document that is not well formed, one that declares a doctype, and one whose row holds a child element with child elements of its own, and SHALL say which file and why.

#### Scenario: A malformed document is refused

- **GIVEN** an XML file with an unclosed element
- **WHEN** the owner imports it
- **THEN** no sheet is created and the owner is told the file could not be read

#### Scenario: A document with a doctype is refused

- **GIVEN** an XML file that declares a doctype
- **WHEN** the owner imports it
- **THEN** no sheet is created and the alert names the doctype

#### Scenario: A nested cell is refused

- **GIVEN** an XML file whose row holds an element that itself has child elements
- **WHEN** the owner imports it
- **THEN** no sheet is created and the alert names the nested element

### Requirement: A sheet exports as XML

Every sheet SHALL offer export as XML, writing one row element per row and one element per cell, with a column whose name is not a valid XML name written as a `cell` element carrying its name as an attribute. Text SHALL be escaped, so exporting and importing a sheet returns the same columns and cell text.

#### Scenario: Export and import round trip

- **GIVEN** a sheet with a column named with a space and a cell holding an ampersand and a less-than sign
- **WHEN** the owner exports it as XML and imports the file
- **THEN** the imported sheet has the same column names and the same cell text

#### Scenario: The format is offered beside the others

- **GIVEN** an open sheet
- **WHEN** the owner opens the export submenu
- **THEN** XML is listed with CSV, JSON and XLSX
