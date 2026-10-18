## Purpose

Environment detection across the three Nuxt runtime contexts.

## Requirements

### Requirement: Shared code reads the build-time environment flags

Environment checks in code that runs in more than one runtime SHALL read the build-time production and development flags, which hold the same value in every runtime.

#### Scenario: A check in browser code

- **GIVEN** the app is built for production
- **WHEN** browser code checks whether it is running in production
- **THEN** the check is true, the same answer the server gives

#### Scenario: A check in the test suite

- **GIVEN** the test suite is running
- **WHEN** a test checks whether it is running in development
- **THEN** the development check is true
- **AND** the production check is false

#### Scenario: A server environment variable read in the browser

- **GIVEN** browser code reads a server environment variable
- **WHEN** the value is read
- **THEN** the value is missing
- **AND** every comparison against it silently evaluates to false

### Requirement: Secrets are read only where they never reach the browser

Secrets, connection strings and private urls SHALL be read only by code that runs on the server or at build time.

#### Scenario: Browser code needs the effect of a secret

- **GIVEN** browser code needs an action that requires a secret
- **WHEN** the action is performed
- **THEN** a server route performs it
- **AND** the secret is never sent to the browser

### Requirement: Published configuration holds only what anyone may read

A configuration value SHALL be published to the browser only once it is safe for anyone who opens the page to read.

#### Scenario: A value placed in the published configuration

- **GIVEN** a value that the browser needs to read
- **WHEN** the value is placed in the configuration published to the browser
- **THEN** it is published only if an endpoint or base url, since anyone who opens the page can read it
