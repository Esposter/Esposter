## ADDED Requirements

### Requirement: The cutover removes every existing webpage and email

The cutover SHALL remove every webpage and email, whatever its state, so that no pre-cutover webpage or email remains.

#### Scenario: A published webpage is removed by the cutover

- **GIVEN** a webpage that is published before the cutover
- **WHEN** the cutover is deployed and its purge has run
- **THEN** the published address no longer shows the webpage

#### Scenario: A webpage in the recycle bin is not restored by the cutover

- **GIVEN** a webpage in an owner's recycle bin before the cutover
- **WHEN** the cutover's purge has run
- **THEN** the recycle bin no longer lists the webpage

### Requirement: The cutover releases the stored files of each removed resource

The cutover SHALL delete the stored files of each removed webpage or email and release their storage to their owner.

#### Scenario: Removing an email releases its stored files

- **GIVEN** an email with uploaded files and a published copy
- **WHEN** the cutover's purge has run
- **THEN** the email's stored files are gone
- **AND** its owner's storage usage falls by their total size

### Requirement: The cutover keeps earned achievements

The cutover SHALL keep every achievement a user has already earned.

#### Scenario: An earned achievement survives the cutover

- **GIVEN** a user who has earned an achievement before the cutover
- **WHEN** the cutover is deployed
- **THEN** the user still holds the achievement

### Requirement: A reviewer can confirm the purge removed every pre-cutover row

The cutover SHALL be confirmed by a count that finds no webpage or email row created before the deploy.

#### Scenario: A count confirms the purge removed every pre-cutover row

- **GIVEN** the cutover has been deployed and its purge has run once in each environment
- **WHEN** a reviewer counts the webpage and email rows created before the deploy
- **THEN** the count is zero

### Requirement: Each editor's script stays within its budget

Each editor's script, measured beyond the explorer and gzipped, SHALL be at most 200 KiB.

#### Scenario: An editor's script loads within the budget

- **GIVEN** the cutover's production build
- **WHEN** the size of each editor's script is measured beyond the explorer, gzipped
- **THEN** each editor's script is at most 200 KiB

#### Scenario: A cutover build over the budget does not merge

- **GIVEN** a cutover build whose editor script is over 200 KiB gzipped
- **WHEN** the build is checked before it merges
- **THEN** the merge is held

### Requirement: A published webpage is one HTML document

Publishing a webpage SHALL produce one HTML document holding its language, its theme, its styles and its content.

#### Scenario: A published webpage is one HTML document

- **GIVEN** a webpage with a language, theme colours and styled nodes
- **WHEN** the webpage is published
- **THEN** a reader receives a single HTML document
- **AND** the document declares the webpage's language
- **AND** the document holds the webpage's theme and styles

### Requirement: Publishing an email compiles its markup and refuses invalid markup

Publishing an email SHALL compile the email to email HTML on the server and SHALL refuse an email whose markup fails strict validation.

#### Scenario: An email with invalid markup is refused at publish

- **GIVEN** an email whose markup fails strict validation
- **WHEN** the owner publishes the email
- **THEN** the publish is refused
- **AND** the refusal shows the validator's message

#### Scenario: A valid email publishes its compiled HTML

- **GIVEN** an email whose markup passes strict validation
- **WHEN** the owner publishes the email
- **THEN** a reader receives the email's compiled HTML

### Requirement: A survey invite links its survey

A survey invite in a webpage or an email SHALL link its survey, so that deleting the survey warns about the page that holds the invite.

#### Scenario: Deleting a surveyed invite's survey names the webpage

- **GIVEN** a webpage with a survey invite for a survey
- **WHEN** the owner deletes the survey
- **THEN** the delete warning names the webpage

### Requirement: A webpage exports as one HTML file

A webpage SHALL export as one self-contained HTML file showing the page as published.

#### Scenario: Exporting a webpage downloads one HTML file

- **GIVEN** a webpage open in the editor
- **WHEN** the owner chooses Export
- **THEN** one HTML file downloads
- **AND** the file shows the webpage without needing any other file

### Requirement: The personalised export works with the editor closed

A personalised export SHALL compile from the saved email and SHALL download one HTML file per dataset row in a zip, with each row's merge fields filled in.

#### Scenario: A personalised export runs with the editor closed

- **GIVEN** a saved email bound to a dataset of two rows
- **WHEN** the owner exports from the command bar with the editor closed
- **THEN** a zip downloads holding two HTML files
- **AND** each file has its row's values in place of the merge fields
- **AND** the export includes the latest saved edit

### Requirement: Restoring a version clears the undo history

Restoring a version SHALL clear the undo history of the open resource.

#### Scenario: Restoring a version leaves nothing to undo

- **GIVEN** a resource with edits in its undo history
- **WHEN** the owner restores a version and then presses Undo
- **THEN** nothing is undone
