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
