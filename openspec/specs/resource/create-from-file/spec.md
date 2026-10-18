## Purpose

Drop a CSV/JSON/XLSX on the Sheet create form to parse, pre-fill the name, and land in a ready Data blade. The file is optional, so a name-only create still works as it always did.

## Requirements

### Requirement: Dropping a file on the Sheet create form pre-fills it

The creator SHALL be able to drop or pick a CSV, JSON or XLSX file on the Sheet create form, which parses it into a preview and pre-fills the name from the file name.

#### Scenario: A dropped file is previewed and named

- **GIVEN** the creator is on the Sheet create form
- **WHEN** they drop a CSV file named "Guests.csv"
- **THEN** the form shows a preview of the first rows
- **AND** the name field reads "Guests"

#### Scenario: The pre-filled name stays editable

- **GIVEN** the name was pre-filled from a file
- **WHEN** the creator changes the name
- **THEN** the changed name is used on create

### Requirement: The file's format comes from its extension

The system SHALL take the format from the file's extension, and SHALL block create for an extension it does not accept while naming the accepted formats.

#### Scenario: A supported extension is accepted

- **GIVEN** the creator drops an XLSX file
- **WHEN** the file is read
- **THEN** it is parsed as a spreadsheet

#### Scenario: An unsupported extension blocks create

- **GIVEN** the creator drops a file with an extension the form does not accept
- **WHEN** they try to create the sheet
- **THEN** create is blocked
- **AND** the message names the formats that are accepted

### Requirement: A file that does not parse blocks create

The system SHALL NOT create a sheet from a file that failed to parse, and SHALL show the parse failure on the file field.

#### Scenario: A malformed file is reported on the file field

- **GIVEN** the creator drops a file that cannot be parsed
- **WHEN** the parse fails
- **THEN** the error appears on the file field
- **AND** create is blocked

### Requirement: Create with a file opens the sheet's rows

The system SHALL create the sheet with its parsed rows already saved, and SHALL open the sheet on its Data blade.

#### Scenario: A successful create opens the Data blade with rows

- **GIVEN** the creator has a parsed file and a valid name
- **WHEN** they create the sheet
- **THEN** the new sheet opens on its Data blade
- **AND** the rows from the file are already there

#### Scenario: A failed save leaves an empty but valid sheet

- **GIVEN** the sheet is created but saving its rows fails
- **WHEN** the creation finishes
- **THEN** the creator is shown the sheet with an error
- **AND** the sheet opens empty rather than with partial data

### Requirement: A name-only create is unchanged

The system SHALL create a sheet with only a name exactly as before when no file is given.

#### Scenario: Creating a sheet with no file

- **GIVEN** the creator enters a name and no file
- **WHEN** they create the sheet
- **THEN** an empty sheet is created
