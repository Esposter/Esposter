## Purpose

One user, several sign-in providers, and the settings section that connects and disconnects them. A user is the set of providers they have connected, so one person keeps one account however many sign-in buttons they have used.

## Requirements

### Requirement: Sign-in is available only through the three supported providers

The sign-in SHALL accept a user only through Google, GitHub or Facebook, and SHALL NOT accept a password.

#### Scenario: A user signs in with a supported provider

- **GIVEN** a user with a Google, GitHub or Facebook account
- **WHEN** the user signs in with that provider
- **THEN** the user is signed in

#### Scenario: A password sign-up is not offered

- **GIVEN** a visitor on the sign-up or sign-in page
- **WHEN** the visitor looks for a way to create an account with a password
- **THEN** no password option is offered

### Requirement: A provider account links to an existing user only when both emails are verified

The sign-in SHALL attach a provider account to an existing user with the same email address only when the provider reports its address as verified and the existing user's address is verified, and SHALL refuse the sign-in otherwise.

#### Scenario: A verified provider account links to a verified user

- **GIVEN** an existing user with a verified address and a provider that reports the same address as verified
- **WHEN** the user signs in with that provider
- **THEN** the provider account is attached to the existing user
- **AND** the user is signed in to that account

#### Scenario: An unverified provider address is refused without writing anything

- **GIVEN** an existing user and a provider that reports the same address as unverified
- **WHEN** the user signs in with that provider
- **THEN** the sign-in is refused
- **AND** the user is sent back with an account-not-linked error
- **AND** no account is written

#### Scenario: An unverified existing user is refused

- **GIVEN** an existing user whose address is not verified and a provider that reports the same address as verified
- **WHEN** the user signs in with that provider
- **THEN** the sign-in is refused with an account-not-linked error

### Requirement: Facebook's address is accepted as proof of ownership

The sign-in SHALL accept the address that Facebook returns as proof of ownership without a verified flag, and SHALL NOT extend that trust to Google or GitHub.

#### Scenario: A Facebook sign-in links to a verified user with the same address

- **GIVEN** an existing user with a verified address and a Facebook account returning the same address without a verified flag
- **WHEN** the user signs in with Facebook
- **THEN** the Facebook account is attached to the existing user

#### Scenario: A Facebook sign-in is refused when the existing user is unverified

- **GIVEN** an existing user whose address is not verified and a Facebook account returning the same address
- **WHEN** the user signs in with Facebook
- **THEN** the sign-in is refused

### Requirement: Accounts link only when their addresses match

The sign-in SHALL refuse to link a provider account whose address differs from the existing user's address.

#### Scenario: A provider with a different address is refused

- **GIVEN** an existing user and a provider account whose address differs
- **WHEN** the user signs in with that provider
- **THEN** the sign-in is refused and no account is linked

### Requirement: Accounts are linked from settings by a signed-in user

The settings section SHALL let a signed-in user connect a provider account to their own account, and SHALL refuse a provider account that already belongs to someone else.

#### Scenario: A user connects a new provider from settings

- **GIVEN** a signed-in user with one provider connected
- **WHEN** the user chooses to link another provider and completes its consent
- **THEN** the provider appears as connected in the settings list

#### Scenario: A provider already owned by another user cannot be linked

- **GIVEN** a provider account that already belongs to a different user
- **WHEN** the signed-in user tries to link it from settings
- **THEN** the page tells the user to sign in with that provider directly

### Requirement: Link errors reach the user once and are cleared from the address

The settings section SHALL show a link failure as a readable message when the user is returned with an error, and SHALL remove that error from the address so that a reload does not show it again.

#### Scenario: A failed link shows a message once

- **GIVEN** a link that fails and returns the user to settings with an error
- **WHEN** the settings page loads
- **THEN** a readable message describing the failure is shown
- **AND** the error is removed from the address

#### Scenario: A reload does not repeat the message

- **GIVEN** settings that has already shown a link failure and cleared it from the address
- **WHEN** the user reloads the page
- **THEN** the message is not shown again

### Requirement: Settings lists every supported provider with its connection state

The settings section SHALL show one row for each supported provider, marked as connected or not, using the same provider list and logos as the sign-in page.

#### Scenario: Each provider has a row in settings

- **GIVEN** a user with one provider connected
- **WHEN** the user opens the linked accounts section
- **THEN** every supported provider has a row
- **AND** only the connected provider is marked as connected

### Requirement: A user can unlink a provider unless it is the last one

The settings section SHALL let a user unlink a provider only while another provider remains connected, and SHALL refuse to remove the last remaining account.

#### Scenario: The last provider cannot be unlinked

- **GIVEN** a user with only one provider connected
- **WHEN** the user views the linked accounts section
- **THEN** the provider is labelled as the only way back into the account
- **AND** its unlink action is disabled

#### Scenario: The server refuses to remove the last account

- **GIVEN** a user with only one provider connected
- **WHEN** a request to unlink that provider reaches the server
- **THEN** the request is refused and the account keeps its provider

#### Scenario: Two unlinks requested together do not remove both

- **GIVEN** a user with two providers connected
- **WHEN** two unlink requests are made at the same time
- **THEN** the requests run one after the other
- **AND** the second request is refused as the last account

### Requirement: Unlinking requires a recent sign-in

The settings section SHALL refuse to unlink a provider when the session is older than its freshness window, and SHALL tell the user to sign in again.

#### Scenario: An old session cannot unlink a provider

- **GIVEN** a session older than its freshness window
- **WHEN** the user tries to unlink a provider
- **THEN** the unlink is refused with a message

#### Scenario: Signing in again clears the refusal

- **GIVEN** a refused unlink caused by an old session
- **WHEN** the user signs out and signs in again
- **THEN** the user can unlink a provider
