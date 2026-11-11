## ADDED Requirements

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
