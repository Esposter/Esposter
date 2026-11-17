## Purpose

Merge fields bound to a dataset, survey invite buttons, and per-row personalized HTML export from the email editor. The personalized export compiles the saved email on the server, zips the files in the browser and is one download; sending email is not part of it.

## Requirements

### Requirement: An email can be bound to a dataset for merge fields

The email author SHALL be able to bind an email to one dataset, after which each of its columns is available as a merge-field item in the palette.

#### Scenario: Binding a dataset offers its columns as merge fields

- **GIVEN** the author binds an email to a sheet with a name column
- **WHEN** they look at the palette
- **THEN** a merge-field item for the name column is available

#### Scenario: Dragging a merge field inserts its token

- **GIVEN** a merge-field item is available
- **WHEN** the author drags it into the email
- **THEN** the email shows the column's token in place

### Requirement: A survey invite is a button to a bound survey

The email author SHALL be able to add a survey invite, a button that links recipients to the survey it is bound to. The survey is chosen from a picker of the author's published surveys.

#### Scenario: A recipient follows a survey invite

- **GIVEN** an email with a survey invite bound to a survey
- **WHEN** the recipient clicks the button
- **THEN** the recipient opens the survey's public page

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

### Requirement: The owner downloads the email as one HTML file

The owner SHALL download the saved email as one HTML file, whether or not the email is bound to a dataset.

#### Scenario: An unbound email downloads as one HTML file

- **GIVEN** an email with no bound dataset
- **WHEN** the owner exports HTML
- **THEN** one HTML file downloads holding the email's markup

#### Scenario: An email that fails strict validation is not downloaded

- **GIVEN** an email whose markup fails strict validation
- **WHEN** the owner exports HTML
- **THEN** no file downloads
- **AND** the validator's message is shown

#### Scenario: A merge field stays as its token in the file

- **GIVEN** an email with a merge field and no bound dataset
- **WHEN** the owner exports HTML
- **THEN** the file shows the merge field's token as written

#### Scenario: An image in the HTML file needs a signed-in session

- **GIVEN** an exported HTML file containing an image from the owner's assets
- **WHEN** the file is opened from disk without a signed-in session
- **THEN** the image is not shown

### Requirement: The owner downloads the email as its MJML source

The owner SHALL download the saved email as one MJML source file.

#### Scenario: The MJML source downloads as one file

- **GIVEN** an email open in the editor
- **WHEN** the owner exports MJML source
- **THEN** one MJML file downloads

#### Scenario: The MJML source imports back to the same email

- **GIVEN** an email exported as MJML source
- **WHEN** the owner imports that file into an empty email
- **THEN** the imported email holds the same sections, columns and content

### Requirement: An export does not download while its save is refused

An export SHALL NOT download a file while the save it starts is refused.

#### Scenario: A refused save stops the download

- **GIVEN** an email whose save the server refuses
- **WHEN** the owner exports HTML or MJML source
- **THEN** no file downloads
- **AND** the refusal is shown

### Requirement: The email offers its three exports together

The export commands of an email SHALL list its HTML, its MJML source and its personalized HTML together.

#### Scenario: The email offers its three exports

- **GIVEN** an email open in the editor
- **WHEN** the owner opens the export commands
- **THEN** the commands list HTML, MJML source and personalized HTML
