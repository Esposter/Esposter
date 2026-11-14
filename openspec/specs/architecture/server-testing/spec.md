## Purpose

tRPC router test wiring — an in-memory D1 database with Miniflare's bindings, and a controlled auth session.

## Requirements

### Requirement: Router tests call procedures directly without network services

Router tests SHALL call procedures directly against an in-memory database and Miniflare's bindings, with no HTTP request and no real cloud resource.

#### Scenario: A router test runs

- **GIVEN** a router test for a set of procedures
- **WHEN** the test runs
- **THEN** each procedure is called directly
- **AND** no connection to a real cloud service is made

### Requirement: The test database is built from the migrations production runs

The test database SHALL be built by applying the migrations the schema generates, the same SQL production runs.

#### Scenario: A test file starts its database

- **GIVEN** a test file that needs a database
- **WHEN** the file starts
- **THEN** the migrations are applied to a new database before its first test

### Requirement: Each test acts as the owner unless it asks for another user

Each test SHALL act as the default owner session unless the test queues another user's session for a single call.

#### Scenario: A test needs a non-owner user for one call

- **GIVEN** a test that queues a session for another user
- **WHEN** the test makes its next call
- **THEN** that call runs as the other user
- **AND** the calls after it run as the owner again

### Requirement: Each test removes its own writes after it runs

Each test SHALL remove the rows and mock state it wrote after it runs, so that no test depends on the test before it.

#### Scenario: A test writes rows and stores objects

- **GIVEN** a test that writes rows and stores objects in a bucket
- **WHEN** the test finishes
- **THEN** the rows it wrote are deleted
- **AND** the objects it stored are removed

### Requirement: A platform binding comes from the one Miniflare instance a test file starts

Each platform binding SHALL come from the Miniflare instance the test file starts, so that a procedure's own calls and a suite's direct reads reach the same binding.

#### Scenario: A suite reads a binding directly

- **GIVEN** a suite that reads a binding rather than calling a procedure
- **WHEN** the suite runs
- **THEN** the read reaches the same Miniflare binding the procedures use

### Requirement: A router that needs the full app runtime runs its tests in that runtime

A router test whose router calls a service that needs the full app runtime SHALL run in the full runtime test environment, and no other router test SHALL.

#### Scenario: The message router test

- **GIVEN** a message router test whose router calls a service that needs the full app runtime
- **WHEN** the test runs
- **THEN** it runs in the full runtime test environment
