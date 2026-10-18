## Purpose

tRPC router test wiring — in-memory database, mocked Azure services, and a controlled auth session.

## Requirements

### Requirement: Router tests call procedures directly without network services

Router tests SHALL call procedures directly against an in-memory database and mocked cloud services, with no HTTP request and no real cloud resource.

#### Scenario: A router test runs

- **GIVEN** a router test for a set of procedures
- **WHEN** the test runs
- **THEN** each procedure is called directly
- **AND** no connection to a real cloud service is made

### Requirement: The test database starts from a snapshot that must match the schema

The test database SHALL start from a prebuilt snapshot of the current schema, and the suite SHALL fail when that snapshot drifts from the schema.

#### Scenario: The schema changes without regenerating the snapshot

- **GIVEN** a schema change that is not yet reflected in the prebuilt snapshot
- **WHEN** the suite runs
- **THEN** the snapshot check fails

### Requirement: Each test acts as the owner unless it asks for another user

Each test SHALL act as the default owner session unless the test queues another user's session for a single call.

#### Scenario: A test needs a non-owner user for one call

- **GIVEN** a test that queues a session for another user
- **WHEN** the test makes its next call
- **THEN** that call runs as the other user
- **AND** the calls after it run as the owner again

### Requirement: Each test removes its own writes after it runs

Each test SHALL remove the rows and mock state it wrote after it runs, so that no test depends on the test before it.

#### Scenario: A test writes rows and events

- **GIVEN** a test that writes rows and sends events to a mocked service
- **WHEN** the test finishes
- **THEN** the rows it wrote are deleted
- **AND** the mocked stores it wrote to are cleared

### Requirement: A cloud client is mocked once in the shared setup

Each cloud client SHALL be replaced by its in-memory mock in the shared test setup, so that the mock covers both a procedure's own calls and a suite's direct imports.

#### Scenario: A suite imports a cloud client directly

- **GIVEN** a suite that imports a cloud client directly rather than through a procedure
- **WHEN** the suite runs
- **THEN** the import receives the in-memory mock

### Requirement: A router that needs the full app runtime runs its tests in that runtime

A router test whose router calls a service that needs the full app runtime SHALL run in the full runtime test environment, and no other router test SHALL.

#### Scenario: The message router test

- **GIVEN** a message router test whose router calls a service that needs the full app runtime
- **WHEN** the test runs
- **THEN** it runs in the full runtime test environment
