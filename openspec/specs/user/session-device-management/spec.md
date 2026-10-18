## Purpose

The Sessions card in user settings — every active session listed, revocable one at a time or all but this one, with push subscriptions and live connections going with the session.

## Requirements

### Requirement: Settings lists the user's active sessions

The Sessions card SHALL list every active session of the signed-in user, with the session the reader is using marked as this device.

#### Scenario: A user sees each active session

- **GIVEN** a user signed in on two browsers
- **WHEN** the user opens the Sessions card
- **THEN** both sessions are listed
- **AND** the session the user is reading from is marked as this device

#### Scenario: An expired session is not listed

- **GIVEN** a session that has run out
- **WHEN** the user opens the Sessions card
- **THEN** the expired session is not listed

#### Scenario: A session older than a day still lists

- **GIVEN** a user who signed in yesterday
- **WHEN** the user opens the Sessions card
- **THEN** the list loads without a sign-in-again error

### Requirement: A row names the browser and the most specific device it can recognise

The Sessions card SHALL name each session's browser with its major version, and SHALL name the device model where it is recognised and the operating system otherwise.

#### Scenario: An Apple device shows its model

- **GIVEN** a session from an Apple device
- **WHEN** the user opens the Sessions card
- **THEN** the row names the browser with its major version and the device model

#### Scenario: A device the browser does not reveal shows its operating system

- **GIVEN** a session from a device whose model is not revealed
- **WHEN** the user opens the Sessions card
- **THEN** the row names the browser and the operating system

#### Scenario: An unrecognised browser shows as an unknown device

- **GIVEN** a session whose browser identity cannot be recognised
- **WHEN** the user opens the Sessions card
- **THEN** the row reads Unknown device
- **AND** the raw browser identity string is not shown

### Requirement: A row shows no operating system version and no raw identity string

The Sessions card SHALL NOT show an operating system version for any session, because the version cannot be trusted.

#### Scenario: A Windows session shows no version number

- **GIVEN** a session from Windows 11
- **WHEN** the user opens the Sessions card
- **THEN** the row shows no operating system version

### Requirement: A session's address and raw identity string never leave the server

The session listing SHALL return each session's device label and SHALL NOT return an address or a raw browser identity string.

#### Scenario: The listing carries no address

- **GIVEN** a user with active sessions
- **WHEN** the Sessions card loads its listing
- **THEN** each session carries a device label
- **AND** no session carries an address or a raw browser identity string

### Requirement: Last active is shown as a relative time

The Sessions card SHALL show each session's last activity as a time that reads as recent rather than exact.

#### Scenario: A session's last activity reads as recent

- **GIVEN** a session that a user has used recently
- **WHEN** the user opens the Sessions card
- **THEN** the row shows a time that reads as recent
- **AND** the time may lag the most recent request

### Requirement: Revoking a session signs it out and removes its live connections

The Sessions card SHALL sign out a session when the user confirms its revocation, and SHALL remove that session's push subscriptions and live connections with it.

#### Scenario: A user revokes another session

- **GIVEN** a session on another device
- **WHEN** the user revokes it and confirms
- **THEN** that session is signed out
- **AND** its row is removed from the list

#### Scenario: A revoke is cancelled

- **GIVEN** a revoke confirmation dialog
- **WHEN** the user cancels it
- **THEN** the session stays active

#### Scenario: A session's push subscription goes with the session

- **GIVEN** a device that receives pushes through a session
- **WHEN** that session is revoked, signed out or expires
- **THEN** the device stops receiving pushes for that session
- **AND** the device subscribes again on its next visit

#### Scenario: A failing live-connection close does not fail the revoke

- **GIVEN** a revoke whose live-connection service cannot be reached
- **WHEN** the user revokes the session
- **THEN** the revoke is reported as successful

### Requirement: Revoking one's own session signs the user out

The Sessions card SHALL sign the reader out when they revoke the session they are using, and SHALL say so before the reader confirms.

#### Scenario: Revoking this device signs the reader out

- **GIVEN** the reader's own session in the list
- **WHEN** the reader confirms its revocation
- **THEN** the reader is taken to the sign-in page

### Requirement: Sign out everywhere else keeps the reader's own session

The Sessions card SHALL revoke every session except the reader's own when the reader chooses to sign out everywhere else.

#### Scenario: Signing out everywhere else keeps this device

- **GIVEN** a reader with three sessions, one of them their own
- **WHEN** the reader chooses to sign out everywhere else and confirms
- **THEN** the other two sessions are signed out
- **AND** the reader's own session stays active

### Requirement: A session can be revoked only by its owner

The revoke SHALL act only on a session the caller owns, and SHALL refuse any other session identifier as not found.

#### Scenario: Another user's session identifier is refused

- **GIVEN** a session identifier that belongs to a different user
- **WHEN** a caller asks to revoke it
- **THEN** the request is refused as not found
- **AND** no session is signed out

### Requirement: A session token never reaches the browser

The Sessions card SHALL name a session only by its identifier, and the server SHALL resolve the session's token itself.

#### Scenario: The client names a session by identifier

- **GIVEN** a revoke request from the Sessions card
- **WHEN** the request is sent
- **THEN** it carries the session's identifier and no token

### Requirement: No administrator can revoke another user's sessions from this card

The Sessions card SHALL offer only the signed-in user's own sessions and SHALL offer no administrator action for another user's sessions.

#### Scenario: An administrator views another user's sessions

- **GIVEN** an administrator viewing another user's account
- **WHEN** the administrator looks for a way to revoke that user's sessions
- **THEN** no such action is offered on the Sessions card

### Requirement: Revoking a session needs only a plain confirmation

The Sessions card SHALL confirm a revoke with a plain dialog and SHALL NOT require the user to type a name.

#### Scenario: A revoke asks for a plain confirmation

- **GIVEN** a session in the list
- **WHEN** the user chooses to revoke it
- **THEN** a confirmation dialog appears
- **AND** the dialog asks for no typed name
