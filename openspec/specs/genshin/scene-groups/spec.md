## Purpose

The open world's scene group record, each group's NPCs, viewpoints and quest triggers by group id beside the scene's building points, every member and place naming the source that filled it, and what only the server's group scripts hold left out.

## Requirements

### Requirement: The record holds members by group and service points by point

The scene group record SHALL hold each group's members under its group id and each service point under its point id, beside one another in a single record.

#### Scenario: A group's members are listed under its id

- **GIVEN** the scene group record has been published
- **WHEN** a group is looked up by its id
- **THEN** every member of that group is listed under it

#### Scenario: A service point is looked up by its id

- **GIVEN** the scene group record has been published
- **WHEN** a service point is looked up by its id
- **THEN** its service, place and turn are returned

### Requirement: Every member and place names the source that filled it

Every member and every place SHALL name the source that filled it.

#### Scenario: A member's source is named

- **GIVEN** a member of a group
- **WHEN** its record is read
- **THEN** the source that named it is given

#### Scenario: A viewpoint's place names its own source

- **GIVEN** a viewpoint is named by the codex and placed by the official map
- **WHEN** its member and its place are read
- **THEN** the member names the codex as its source
- **AND** the place names the official map as its source

### Requirement: A viewpoint is placed only where its name matches one map point

A viewpoint SHALL be placed only where its name matches exactly one map point, decided by elimination among the viewpoints, and SHALL otherwise be left without a place.

#### Scenario: A name on several map points leaves the viewpoint unplaced

- **GIVEN** a viewpoint's name is written on several map points
- **WHEN** the viewpoints are matched
- **THEN** the viewpoint is left without a place

#### Scenario: A viewpoint sharing its only point leaves it unplaced

- **GIVEN** two viewpoints each have only one candidate point and it is the same point
- **WHEN** the viewpoints are matched
- **THEN** neither viewpoint is placed on that point

#### Scenario: A longer name takes its own point before a name written inside it

- **GIVEN** one viewpoint's name is written inside a longer viewpoint's name
- **WHEN** the longer name takes its own point
- **THEN** the shorter name no longer matches that point

#### Scenario: A viewpoint under the ground is left without a place

- **GIVEN** a viewpoint's matched point lies on a layer under the ground
- **WHEN** the viewpoint is placed
- **THEN** it is left without a place

### Requirement: Only open-world rows are kept from the group tables

The record SHALL keep only the rows of the trigger and codex tables that belong to the open world.

#### Scenario: A row from another scene is left out

- **GIVEN** a trigger row belongs to a scene other than the open world
- **WHEN** the record is built
- **THEN** the row is not kept

### Requirement: Fields only the server's group scripts hold are left unset

A field that only the server's group scripts hold SHALL be left unset rather than guessed from a nearby source.

#### Scenario: A camp's monsters are not guessed

- **GIVEN** a camp's monsters and their levels are needed
- **WHEN** the record is read
- **THEN** the record gives no monsters for the camp
- **AND** the camp keeps its stand-in

#### Scenario: A trigger's region is left without a place

- **GIVEN** a trigger member names its group
- **WHEN** the record is read
- **THEN** the trigger has no place in the record

### Requirement: Service keepers without a birth are absent while their points are kept

A service keeper with no NPC birth SHALL be absent from the record while the points of that keeper's service are still kept.

#### Scenario: A service point is kept without its keeper

- **GIVEN** a city's service keeper has no NPC birth
- **WHEN** the record is built
- **THEN** the service point for that keeper's service is kept
- **AND** the keeper is not placed in the record
