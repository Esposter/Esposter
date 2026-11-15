# architecture/ai-native-resources/agent-keys Specification

## Purpose

An agent's key carries the scopes its tools need, and a key with no scope reaches no tool. The operations nothing can undo, such as the purge of a resource and the deletion of a respondent's answer, are declared the owner's alone and are never served to a key, whatever its scopes.

## Requirements

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
