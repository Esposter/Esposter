## Purpose

The better-auth OAuth setup, session middleware, and the authed/rate-limited tRPC procedure chain.

## Requirements

### Requirement: Accounts sign in only through third-party providers

Account sign-in SHALL be available only through the supported third-party providers, and no password sign-in SHALL be offered.

#### Scenario: A visitor signs in with a provider

- **GIVEN** a signed-out visitor on the sign-in page
- **WHEN** the visitor chooses a provider
- **THEN** the visitor is sent to that provider to sign in

#### Scenario: No password sign-in is offered

- **WHEN** a visitor looks for a password sign-in on the sign-in page
- **THEN** none is offered

### Requirement: Account pages send signed-out visitors to sign in

A page that needs an account SHALL send a signed-out visitor to the sign-in page, and the sign-in page SHALL send a signed-in visitor away from it.

#### Scenario: A signed-out visitor is sent to sign in

- **GIVEN** a signed-out visitor
- **WHEN** the visitor opens a page that needs an account
- **THEN** the visitor is sent to the sign-in page

#### Scenario: A signed-in visitor leaves the sign-in page

- **GIVEN** a signed-in visitor
- **WHEN** the visitor opens the sign-in page
- **THEN** the visitor is sent away from it

#### Scenario: Public pages open to everyone

- **WHEN** a signed-out visitor opens a public page
- **THEN** the page opens without a sign-in

### Requirement: Signed-in operations refuse callers without a session

An operation that needs an account SHALL refuse a caller with no session, and SHALL count every call against the standard request budget.

#### Scenario: A call with no session is refused

- **WHEN** a caller with no session calls an operation that needs an account
- **THEN** the call is refused

#### Scenario: A call over the budget is refused as rate limited

- **GIVEN** a signed-in caller who has used the standard request budget
- **WHEN** the caller makes another call
- **THEN** the call is refused as rate limited

### Requirement: Public reads are limited without requiring a session

A public read SHALL be available without a session and SHALL still count against the request budget.

#### Scenario: An anonymous visitor reads a public feed

- **WHEN** a signed-out visitor reads a public feed
- **THEN** the read is answered

### Requirement: A first sign-in creates the account without a biography

A first sign-in SHALL create the account even when the provider profile carries no biography.

#### Scenario: A new account is created with an empty biography

- **WHEN** a new person signs in through a provider profile with no biography
- **THEN** the account is created with an empty biography

### Requirement: A provider identity maps to exactly one account

A provider identity SHALL map to exactly one account, and a sign-in that finds two accounts for one identity SHALL be refused.

#### Scenario: A duplicate provider identity locks its owner out

- **GIVEN** two account records exist for the same provider identity
- **WHEN** the owner signs in with that provider
- **THEN** the sign-in is refused until the duplicate is removed

### Requirement: Each person can see and revoke every active session

Each signed-in person SHALL see every active session of their account and SHALL be able to revoke any of them, with the session's push subscriptions and live connections ending with it.

#### Scenario: The owner lists every active session

- **WHEN** the owner opens the session management section of their settings
- **THEN** every active session of the account is listed

#### Scenario: Revoking a session ends its live connections

- **GIVEN** a session with push subscriptions and an open connection
- **WHEN** the owner revokes that session
- **THEN** its push subscriptions are removed and its connection is closed

### Requirement: A device is identified consistently across requests

A browser SHALL be identified as the same device across requests, and two different browsers SHALL be identified as different devices.

#### Scenario: The same browser keeps its device identity

- **WHEN** the same browser makes two requests
- **THEN** both requests carry the same device identity

#### Scenario: Push subscriptions are scoped to their device

- **GIVEN** a push subscription made from one browser
- **WHEN** a second browser signed into the same account is sent a notification
- **THEN** the subscription of the first browser is not used for the second

### Requirement: Browsing stays open while writing requires an account

Browsing SHALL remain open to anonymous visitors, and writing and personal state SHALL require an account.

#### Scenario: An anonymous visitor plays a game saved on the device

- **WHEN** an anonymous visitor plays a game that keeps its progress on the device
- **THEN** the progress is kept without an account

#### Scenario: An anonymous visitor cannot write personal state

- **WHEN** an anonymous visitor tries to save personal state
- **THEN** the save is refused and the visitor is asked to sign in
