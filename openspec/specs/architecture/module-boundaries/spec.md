## Purpose

The app's three import zones — shared/ is parsed by the server, so it may never reach into the client-only app tree.

## Requirements

### Requirement: The shared zone never imports from the client-only zone

Code in the shared zone SHALL NOT import from the client-only zone, including type-only imports, while the client-only zone and the server zone MAY import the shared zone.

#### Scenario: A shared module imports a client-only module

- **GIVEN** a module in the shared zone
- **WHEN** it imports a module from the client-only zone, even a type-only import
- **THEN** the lint fails the change

#### Scenario: A server route imports a shared module

- **GIVEN** a server route that needs a shared schema
- **WHEN** it imports that module from the shared zone
- **THEN** the import is allowed

### Requirement: A client-side form is derived from the shared schema

When a client-side form needs the presentation of a shared rule, the form SHALL be derived from the shared schema rather than restating it.

#### Scenario: A constraint is added to the shared schema

- **GIVEN** a form derived from a shared schema
- **WHEN** a constraint is added to the shared schema
- **THEN** the form enforces the constraint without a copy of it

#### Scenario: The form stops matching the shared type

- **GIVEN** a form that is typed against the shared type
- **WHEN** the form no longer matches what the server parses
- **THEN** the change fails to typecheck

### Requirement: Client-only code stays out of the shared zone

Code that no server module uses and that imports no client code SHALL be moved to the client-only zone, unless it is one of the recorded exceptions.

#### Scenario: A module in the shared zone that only the client uses

- **GIVEN** a module in the shared zone that no server module imports and that imports no client code
- **WHEN** the module is reviewed
- **THEN** it is moved to the client-only zone
- **AND** it stays in the shared zone only if it is a recorded exception

### Requirement: A workspace package is imported where it lives

A workspace package SHALL be imported directly by its callers rather than through a file that only re-exports one of its names.

#### Scenario: A server file only re-exports a package name

- **GIVEN** a server file whose whole body re-exports one name from a workspace package
- **WHEN** the file is reviewed
- **THEN** the file is deleted
- **AND** its callers import the package directly

#### Scenario: A local function adds a decision on top of a package function

- **GIVEN** a local function that wraps a package function with its own meaning
- **WHEN** the file is reviewed
- **THEN** the local function is kept

### Requirement: No import leads back to the module it came from

No import SHALL lead back to the module it came from, through any chain of modules and including imports the platform resolves automatically.

#### Scenario: Written imports close a loop

- **GIVEN** written imports that lead from a module back to itself
- **WHEN** lint runs
- **THEN** the lint fails the change

#### Scenario: An automatic import closes a loop

- **GIVEN** an automatic import that leads from a module back to itself
- **WHEN** the test suite runs
- **THEN** the test suite fails

### Requirement: Build-time generators are exempt from the shared-zone import ban

Build-time code generators SHALL be allowed to import from the client-only zone for the models they emit against.

#### Scenario: A code generator reads client models

- **GIVEN** a code generator that emits code against client models
- **WHEN** it imports those models from the client-only zone
- **THEN** the import is allowed
