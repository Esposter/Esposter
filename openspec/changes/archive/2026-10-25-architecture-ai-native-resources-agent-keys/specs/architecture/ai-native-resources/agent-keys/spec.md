## ADDED Requirements

### Requirement: Keys made before scopes gain the follow-ups scope

A key created before scopes existed SHALL be given the follow-ups scope and no other scope when the application starts.

#### Scenario: A key created before scopes can run the follow-ups

- **GIVEN** a key was created before scopes existed and holds no permissions
- **WHEN** the application starts
- **THEN** the key can call the follow-ups tools
- **AND** the key is refused every other tool

#### Scenario: A key that already holds scopes keeps them

- **GIVEN** a key already holds one or more scopes
- **WHEN** the application starts
- **THEN** the key's scopes are unchanged

### Requirement: Human-only operations are never served to a key

An operation declared human-only SHALL NOT be listed to any key, whatever scopes the key holds.

#### Scenario: Human-only operations are not listed to a key with every scope

- **GIVEN** a key holds every scope
- **WHEN** the key lists its tools
- **THEN** purging a resource is not among them
- **AND** deleting a survey response is not among them
- **AND** creating, updating and reading a survey response are not among them

#### Scenario: A key cannot call a human-only operation by name

- **GIVEN** a key holds every scope
- **WHEN** the key calls purging a resource
- **THEN** the call is refused
- **AND** the resource is not purged

### Requirement: Operations a person can undo stay open to keys

An operation that a revision, the recycle bin or an unpublish can undo SHALL be served to a key that holds the scope it needs.

#### Scenario: A key moves a resource to the bin and back

- **GIVEN** a key holds the Resources scope
- **WHEN** the key moves a resource to the bin and then restores it
- **THEN** the resource comes back whole

#### Scenario: A key publishes a resource

- **GIVEN** a key holds the Resources scope and the resource's type publishes
- **WHEN** the key publishes the resource
- **THEN** the resource is published

### Requirement: CI refuses an undecided type-specific procedure

CI SHALL refuse a resource type's own procedure that declares neither a key description nor a human-only reason.

#### Scenario: A new type-specific procedure without a declaration fails CI

- **GIVEN** a resource type adds a procedure the generic set does not provide and declares neither a key description nor a human-only reason
- **WHEN** CI runs
- **THEN** CI fails until its author declares one

#### Scenario: Every type-specific procedure declares its key access

- **GIVEN** every procedure a resource type adds beyond the generic set declares a key description or a human-only reason
- **WHEN** CI runs
- **THEN** the check passes
