## Purpose

The free-tier budget guard cycle and the recorded cost, security, and retention decisions for Esposter's Azure estate.

## Requirements

### Requirement: Budget guard stops metered application work

Each environment's budget guard SHALL stop the Function Apps and the two highest-volume application event subscriptions when metered spend registers, and a second guard SHALL restore them.

#### Scenario: Spend registers

- **GIVEN** an environment's budget has been exceeded by any metered spend
- **WHEN** the guard fires
- **THEN** the Function Apps are stopped
- **AND** the two highest-volume application event subscriptions are deleted

#### Scenario: Restore after the guard

- **GIVEN** the guard has stopped the application work
- **WHEN** the restore guard runs
- **THEN** the Function Apps are started
- **AND** the event subscriptions are recreated as they are declared

#### Scenario: Restore fails to read a subscription

- **GIVEN** reading an event subscription during restore fails or times out
- **WHEN** the restore runs
- **THEN** that subscription is recreated from its declaration

### Requirement: Replay and blob-deletion subscriptions keep running under the guard

The budget guard SHALL leave the dead-letter replay subscription and the blob-deletion subscription running.

#### Scenario: Guard fires during an outage

- **GIVEN** the budget guard has fired
- **WHEN** dead letters are written during the outage
- **THEN** the dead-letter replay subscription is still in place
- **AND** the blob-deletion subscription still accepts its events

### Requirement: Postures stay cheapest until blocking clients migrate

Each Azure resource's posture SHALL be the cheapest one that keeps the application working, and a hardening step blocked by key-based clients SHALL stay deferred until the application migrates off them.

#### Scenario: Hardening considered before migration

- **GIVEN** a hardening step depends on the application no longer using key-based clients
- **WHEN** the step is considered for an infrastructure change
- **THEN** it is not applied until the application has migrated

#### Scenario: Storage network default-deny

- **GIVEN** the storage account has no complete allowlist or private endpoint
- **WHEN** an infrastructure change is reviewed
- **THEN** default-deny network access is not applied to the storage account

### Requirement: Budgets are one cent in both environments

Each environment's budget SHALL be one cent with identical behaviour in development and production.

#### Scenario: Budget in each environment

- **GIVEN** the development and production environments are both deployed
- **WHEN** their budgets are compared
- **THEN** both are one cent with the same guard behaviour

### Requirement: Infrastructure changes protect imported resources and check references first

An infrastructure change SHALL keep imported resources protected from replacement and SHALL NOT delete a resource before its downstream references have been checked.

#### Scenario: Deleting a resource

- **GIVEN** a change would delete a resource
- **WHEN** the change is reviewed
- **THEN** the application, function, event and workflow references to it are checked first
