## Purpose

Why a procedure returns a registered class or a plain object and never an unregistered class instance, which silently loses the dates inside it.

## Requirements

### Requirement: A procedure returns a registered class instance or a plain object

A procedure SHALL return either a registered class instance or a plain object, and SHALL NOT return an unregistered class instance.

#### Scenario: A paginated list returned as a plain object

- **GIVEN** a procedure that returns a paginated list as a plain object with dated items
- **WHEN** a client calls the procedure
- **THEN** the items' dates arrive as dates

#### Scenario: An unregistered class instance returned

- **GIVEN** a procedure that returns an instance of a class that is not registered, holding dated fields
- **WHEN** a client calls the procedure
- **THEN** the dated fields arrive as text rather than dates
- **AND** no error is shown to the client

### Requirement: A test handler returns the same shape as the server

A test handler SHALL return the same shape the server returns, so that a fixture built from the wrong shape fails the test.

#### Scenario: A fixture built as a class where the server returns a plain object

- **GIVEN** a test handler that builds a class instance where the server returns a plain object
- **WHEN** the test compares dates
- **THEN** the test fails on the dates
