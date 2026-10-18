## Purpose

The Overview blade's Related resources card — what uses this resource and what it uses, each a link, read off the resource-link index in one round trip.

## Requirements

### Requirement: The Overview shows related resources in two columns

The Overview SHALL show a Related resources card with a Used by column and a Uses column.

#### Scenario: Owner opens the Overview

- **GIVEN** a resource has related resources
- **WHEN** the owner opens its Overview
- **THEN** the Related resources card shows Used by and Uses

### Requirement: Used by lists only the owner's live resources

The Used by column SHALL list only the owner's own live resources that reference this resource.

#### Scenario: A referencing resource is in the recycle bin

- **GIVEN** a dashboard that charts this resource is in the recycle bin
- **WHEN** the owner opens this resource's Overview
- **THEN** the dashboard is not listed under Used by

### Requirement: Uses names only the referenced resources the owner can read

The Uses column SHALL name only the referenced resources the owner can read, and SHALL count the rest without naming them.

#### Scenario: A referenced resource was deleted

- **GIVEN** this resource references a resource that was deleted
- **WHEN** the owner opens the Overview
- **THEN** Uses reports one referenced resource cannot be found
- **AND** the deleted resource is not named

### Requirement: Each listed resource is a link to it

Each resource listed in either column SHALL be a link to that resource.

#### Scenario: Owner follows a related resource

- **GIVEN** the Related resources card lists a resource
- **WHEN** the owner selects its row
- **THEN** the owner is taken to that resource

### Requirement: A resource bound in two roles is listed once

A resource referenced by this resource in two roles SHALL be listed once under Uses.

#### Scenario: Survey used as audience and survey

- **GIVEN** a program uses a survey as both its audience and its survey
- **WHEN** the owner opens the program's Overview
- **THEN** the survey is listed once under Uses

### Requirement: The card shows placeholders while loading and a retry on failure

The Related resources card SHALL show placeholder rows while its data loads and a retry action when the read fails.

#### Scenario: The read fails

- **GIVEN** the related resources read fails
- **WHEN** the owner opens the Overview
- **THEN** the card shows a failed state with a retry action

### Requirement: Each column holds a bounded number of resources

Each column SHALL hold at most a fixed maximum number of resources.

#### Scenario: More references than the maximum

- **GIVEN** a resource is referenced by more resources than the maximum
- **WHEN** the owner opens the Overview
- **THEN** the Used by column lists only the maximum number of resources
