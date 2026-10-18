## Purpose

Every resource that serves a dataset and has no export of its own gains Export CSV of that dataset from one generic command, survey responses first, with question titles as headers and untrusted answers neutralised as formulas. The file is a single flat table and CSV is the only format offered.

## Requirements

### Requirement: Dataset resources offer one Export CSV command

The resource menu SHALL offer Export CSV for each resource that serves a dataset and has no export of its own, and SHALL NOT offer it on a resource that already has its own export.

#### Scenario: A survey offers Export CSV

- **GIVEN** the owner has a survey
- **WHEN** they open its overflow menu
- **THEN** Export CSV is listed

#### Scenario: A program offers Export CSV

- **GIVEN** the owner has a program
- **WHEN** they open its overflow menu
- **THEN** Export CSV is listed

#### Scenario: A sheet keeps its own export

- **GIVEN** the owner has a sheet
- **WHEN** they open its overflow menu
- **THEN** its own Import and Export entries are listed and Export CSV of the dataset is not added

### Requirement: The file is named after its resource and uses question titles as headers

The export SHALL name the file after the resource and SHALL use each column's title as its header where the column has one.

#### Scenario: A survey export is named after the survey

- **GIVEN** the owner exports a survey named "Feedback"
- **WHEN** the download finishes
- **THEN** the file is named "Feedback.csv"

#### Scenario: A question's title becomes its header

- **GIVEN** a survey question titled "How did you hear about us?"
- **WHEN** the owner exports the survey
- **THEN** that question's column header reads "How did you hear about us?"

### Requirement: A survey export leads with submission time and, when identified, the respondent

The survey export SHALL put the submission time in the first column, and SHALL include a respondent column only when the survey is identified, showing a public identifier and never a token or key value.

#### Scenario: An anonymous survey has no respondent column

- **GIVEN** the survey does not identify respondents
- **WHEN** the owner exports it
- **THEN** the columns are the submission time followed by the questions

#### Scenario: An identified survey shows a public identifier

- **GIVEN** the survey identifies respondents
- **WHEN** the owner exports it
- **THEN** a respondent column follows the submission time
- **AND** it shows the public identifier and no token

#### Scenario: A response with no respondent leaves the cell empty

- **GIVEN** a response has no participant behind it
- **WHEN** the owner exports the survey
- **THEN** that response's respondent cell is empty

### Requirement: Checkbox answers are joined into one cell

The export SHALL join the answers to a checkbox question into one cell separated by a semicolon and space.

#### Scenario: Two checked options share one cell

- **GIVEN** a respondent checked "Email" and "Phone" on a checkbox question
- **WHEN** the owner exports the survey
- **THEN** that answer's cell reads "Email; Phone"

### Requirement: Answers cannot run as formulas in a spreadsheet

The export SHALL neutralise any cell beginning with a formula character, so that text typed by a respondent is not run as a formula when the file is opened.

#### Scenario: An answer starting with an equals sign is neutralised

- **GIVEN** a respondent typed an answer beginning with "="
- **WHEN** the owner exports the survey
- **THEN** the cell is written so that it opens as plain text

#### Scenario: A sheet export keeps the owner's formulas

- **GIVEN** the owner exports a sheet containing text beginning with "="
- **WHEN** the file is exported as a sheet
- **THEN** the text is written unchanged

### Requirement: A question named like a reserved column keeps its own column

The export SHALL keep a question's own column when its name matches a reserved column, and SHALL give the reserved column a trailing underscore instead.

#### Scenario: A question named submittedAt keeps its name

- **GIVEN** a survey has a question named "submittedAt"
- **WHEN** the owner exports the survey
- **THEN** the question's column is named "submittedAt"
- **AND** the submission time column is named "submittedAt_"

### Requirement: A capped export says so

The export SHALL warn when the dataset was cut short, and SHALL NOT present the file as complete.

#### Scenario: A capped survey export warns the owner

- **GIVEN** a survey has more responses than the export reads
- **WHEN** the owner exports it
- **THEN** the file holds the rows that were read
- **AND** an alert says the file is not every response

### Requirement: The export is CSV only

The export SHALL offer CSV as its only format and SHALL NOT offer a live-linked spreadsheet.

#### Scenario: Only CSV is offered

- **GIVEN** the owner opens Export CSV
- **WHEN** they look for other formats
- **THEN** only CSV is offered
