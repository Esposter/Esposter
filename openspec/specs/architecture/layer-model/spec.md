## Purpose

The cross-product layer model — identity, resources, datasets, publishing, and events — that links Esposter's products together.

## Requirements

### Requirement: A product joins the platform as one resource type

Each product SHALL join the platform by adding one resource type, and a resource SHALL have a capability only when it declares that capability.

#### Scenario: A new product is added

- **GIVEN** a new product
- **WHEN** it is added to the platform
- **THEN** it is added as one resource type entry
- **AND** no new service or bespoke page is added for it

#### Scenario: A resource type that declares no capability

- **GIVEN** a resource type that does not declare a capability
- **WHEN** the platform checks for that capability
- **THEN** the capability is absent rather than switched off

### Requirement: Games stay outside the resource model

Games, anime and the fluid simulator SHALL take part only in achievements, and SHALL NOT gain naming, sharing or dataset behaviour.

#### Scenario: A player performs a game action

- **GIVEN** a player in a game
- **WHEN** the player performs an action that changes game state
- **THEN** the action triggers achievements

#### Scenario: A game save is stored

- **GIVEN** a game save
- **WHEN** it is stored
- **THEN** it has no naming, sharing or dataset behaviour

### Requirement: Every mutation is an achievement trigger

Every mutation SHALL be an achievement trigger with no extra wiring.

#### Scenario: A new mutation is added

- **GIVEN** a new mutation added to the platform
- **WHEN** a player's action performs it
- **THEN** the mutation can trigger achievements without additional wiring

### Requirement: A publishable resource has a public versioned read

A publishable resource SHALL keep a versioned published copy that anyone can read at a public address, with the reads rate limited.

#### Scenario: A viewer opens a published resource

- **GIVEN** a resource published at a public address
- **WHEN** a viewer opens that address
- **THEN** the viewer sees the published version

#### Scenario: A viewer opens an unpublished resource

- **GIVEN** a resource that is not published
- **WHEN** a viewer opens its public address
- **THEN** the page is not found

#### Scenario: A viewer reads too often

- **GIVEN** a public address being read at a rate above its limit
- **WHEN** further reads arrive
- **THEN** the reads are rate limited

### Requirement: A dataset consumer copies or re-resolves what it binds

A resource that declares a dataset SHALL serve its columns and rows to dataset consumers, and a consumer SHALL either copy them once or re-resolve them live each time it loads.

#### Scenario: Survey responses are imported into a sheet

- **GIVEN** a survey with collected responses
- **WHEN** the creator imports the responses into a sheet
- **THEN** the sheet receives a one-time copy of the rows

#### Scenario: A dashboard bound to a dataset loads

- **GIVEN** a dashboard bound to a dataset
- **WHEN** the dashboard loads
- **THEN** the dataset is resolved again from its source

### Requirement: Every resource is keyed by the one user identity

Every row, storage path and session SHALL be keyed by the one user identity shared by all products.

#### Scenario: A user's resources are stored

- **GIVEN** a user with resources in several products
- **WHEN** the resources are stored
- **THEN** each is keyed by that user's identity
