## ADDED Requirements

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
