## Purpose

Soft delete with restore — deletedAt marking, a bin page for restore or permanent purge, and a 30-day timer auto-purge.

## Requirements

### Requirement: Deleting moves a resource to the recycle bin

A resource the owner deletes SHALL be moved to the recycle bin rather than destroyed.

#### Scenario: Delete keeps the content

- **GIVEN** the owner has a resource with content and files
- **WHEN** the owner deletes it and confirms
- **THEN** the resource leaves every list
- **AND** its content and files are kept in the recycle bin

### Requirement: Restoring returns a resource as a draft

A restored resource SHALL return as a draft and SHALL NOT be published again automatically.

#### Scenario: Restoring a previously published resource

- **GIVEN** a published resource was deleted
- **WHEN** the owner restores it from the recycle bin
- **THEN** the resource is a draft
- **AND** its public address stays unpublished
- **AND** a notice says it was restored as a draft

### Requirement: Restoring brings back the content as it was

Restoring a resource SHALL bring back its content and files exactly as they were when it was deleted.

#### Scenario: Restore after delete

- **GIVEN** a draft resource with content and files was deleted
- **WHEN** the owner restores it
- **THEN** the content and the files match what they were before the delete

### Requirement: The recycle bin lists only the owner's resources

The recycle bin SHALL list only the signed-in owner's own deleted resources.

#### Scenario: Owner opens the recycle bin

- **GIVEN** two users each have deleted resources
- **WHEN** one user opens the recycle bin
- **THEN** only that user's deleted resources are listed

### Requirement: Permanent deletion requires typing the resource name

A resource SHALL be purged permanently only after the owner types its name exactly.

#### Scenario: Owner types the correct name

- **GIVEN** a resource is in the recycle bin
- **WHEN** the owner types its name and confirms delete forever
- **THEN** the resource is purged

#### Scenario: Owner types a different name

- **GIVEN** a resource is in the recycle bin
- **WHEN** the owner types a different name and confirms delete forever
- **THEN** nothing is purged

### Requirement: Resources are purged automatically after 30 days

A resource SHALL be purged permanently once it has been in the recycle bin for 30 days.

#### Scenario: Sweep purges an expired resource

- **GIVEN** a resource was deleted 30 or more days ago
- **WHEN** the daily sweep runs
- **THEN** the resource is purged permanently

#### Scenario: Sweep keeps a resource still inside the window

- **GIVEN** a resource was deleted 29 days ago
- **WHEN** the daily sweep runs
- **THEN** the resource is kept in the recycle bin

### Requirement: The recycle bin shows the days left before purge

The recycle bin SHALL show how many days each resource has left, warning when nine days remain and showing danger when three remain.

#### Scenario: Resource nearing purge

- **GIVEN** a resource has three days left in the recycle bin
- **WHEN** the owner views the recycle bin
- **THEN** its remaining time is shown in the danger colour

### Requirement: A failed purge is completed by a later attempt

A purge that fails part way SHALL be completed by a later attempt, and it SHALL NOT leave the resource's files orphaned.

#### Scenario: Purge fails part way

- **GIVEN** a purge of a resource failed after removing some of its files
- **WHEN** the next purge attempt runs
- **THEN** the purge completes and the resource is gone

### Requirement: One failing purge does not block the others

A resource that cannot be purged SHALL NOT stop the sweep from purging the other expired resources.

#### Scenario: One resource fails during the sweep

- **GIVEN** two expired resources and one of them cannot be purged
- **WHEN** the daily sweep runs
- **THEN** the other expired resource is purged
- **AND** the failing one is retried on the next sweep

### Requirement: A binned resource reads as missing to anything referencing it

A resource in the recycle bin SHALL read as missing to every consumer that references it.

#### Scenario: A consumer references a binned resource

- **GIVEN** a dashboard charts a resource that is in the recycle bin
- **WHEN** the owner opens the dashboard
- **THEN** the reference shows as a missing source
- **AND** restoring the resource makes the reference work again
