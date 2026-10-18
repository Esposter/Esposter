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

### Requirement: A Blueprint's webpage and email entries deploy as fresh documents

The cutover SHALL remove the editor content from each Blueprint entry of webpage or email type, so that deploying the entry creates an empty document.

#### Scenario: A Blueprint's webpage entry deploys as a fresh document

- **GIVEN** a Blueprint whose captured entry is a webpage
- **WHEN** an owner deploys the Blueprint after the cutover
- **THEN** the deployed webpage starts as an empty document

#### Scenario: A Blueprint revision from before the cutover is refused

- **GIVEN** a Blueprint revision saved before the cutover that holds a webpage entry with editor content
- **WHEN** an owner deploys that revision
- **THEN** the deploy fails for that entry with the parse error

### Requirement: A program keeps the reference to a deleted email

A program whose invite email is removed by the cutover SHALL keep its reference to that email and SHALL read the reference as missing.

#### Scenario: A program keeps its reference to a deleted email

- **GIVEN** a program whose invite is bound to an email removed by the cutover
- **WHEN** the owner opens the program
- **THEN** the invite shows that its email is missing

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
