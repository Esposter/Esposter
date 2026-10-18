## Purpose

Email is Publishable — a hosted, unpersonalized copy of the compiled email at /view/Email/[id], the standard "view in browser" artifact. The public copy is one static artifact and shows merge fields as authored.

## Requirements

### Requirement: A published email has a public browser view

The owner SHALL be able to publish an email, which gives it a public web view showing the compiled email as a browser copy.

#### Scenario: Publishing makes the email viewable at its URL

- **GIVEN** the owner has an email with content
- **WHEN** they publish it
- **THEN** the email is viewable at its public view address
- **AND** the page shows the compiled email

#### Scenario: Unpublishing removes the public view

- **GIVEN** an email is published
- **WHEN** the owner unpublishes it
- **THEN** its public view address no longer shows the email

### Requirement: The public copy shows merge fields as authored

The public view SHALL show merge-field tokens exactly as the author wrote them, and SHALL NOT fill them per recipient.

#### Scenario: A merge field appears unfilled in the public view

- **GIVEN** the email body contains a merge field
- **WHEN** a viewer opens the public view
- **THEN** the merge field is shown as written, not as a recipient's value

### Requirement: The public view holds the last compiled copy

The system SHALL keep the compiled copy saved on each editor save, and SHALL publish that copy, warning the author when the latest compile failed.

#### Scenario: A failed compile keeps the last good copy and warns

- **GIVEN** the author saves an email whose compile fails
- **WHEN** the save finishes
- **THEN** the save is kept
- **AND** the author is warned that the hosted copy is behind until a compile succeeds

#### Scenario: A publish after a good compile shows the new content

- **GIVEN** the author's latest compile succeeded
- **WHEN** the owner publishes the email
- **THEN** the public view shows that compiled content

### Requirement: The public view cannot reach the viewer's session

The public view SHALL run an email's scripts without giving them access to the viewer's session.

#### Scenario: A script in a published email cannot reach the viewer's session

- **GIVEN** a published email contains a script
- **WHEN** a viewer opens its public view
- **THEN** the script runs in isolation from the viewer's signed-in session

### Requirement: Each published email is one shared copy

The system SHALL publish one copy per email and SHALL NOT produce a personalized web version per recipient.

#### Scenario: Every viewer sees the same copy

- **GIVEN** an email is published
- **WHEN** two different viewers open its public view
- **THEN** both see the same copy of the email
