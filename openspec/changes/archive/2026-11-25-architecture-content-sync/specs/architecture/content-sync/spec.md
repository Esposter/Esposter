## ADDED Requirements

### Requirement: Saves of an open resource go one at a time and the latest wins

An open resource SHALL have at most one content save in flight, and the saves asked for while it is in flight SHALL be sent as one save of the latest content once it answers.

#### Scenario: Saves asked for during a save send only the latest once it answers

- **GIVEN** a save is in flight
- **WHEN** two more saves are asked for before it answers
- **THEN** once it answers, one save is sent carrying the latest content

### Requirement: Only a newer content version is another writer's

An open resource SHALL treat a row as another writer's save only when its content version is newer than the version it confirmed, and a newer version naming the content it already holds SHALL only move its version on.

#### Scenario: A late row of a device's own earlier save is not adopted

- **GIVEN** a device saved a resource twice
- **WHEN** the row its first save wrote arrives after the second save's answer
- **THEN** the content is not read again

#### Scenario: A newer row naming the content already held moves the version without a read

- **GIVEN** an open resource with nothing unsaved
- **WHEN** a row names a newer version of the content it already holds
- **THEN** its confirmed version moves to the row's
- **AND** no content is read

### Requirement: Another writer's content never replaces an unsaved edit

Another writer's content SHALL replace what is on screen only when no edit was made since the open resource decided to adopt it, unless the person takes their version.

#### Scenario: An edit made while another device's save is adopted stays on screen

- **GIVEN** an open resource is reading another device's save to adopt it
- **WHEN** the person edits before the content arrives
- **THEN** the content is not applied
- **AND** the person is offered the choice between the two versions

### Requirement: A save refused as stale offers the choice

A save refused because another writer moved the content version on SHALL offer the person the choice between the two versions, once the row names the newer version.

#### Scenario: A save refused as stale offers the choice once the row names the newer version

- **GIVEN** a save is in flight
- **WHEN** the server refuses it as stale
- **THEN** the row is read
- **AND** the choice is offered at the version the row names

### Requirement: A failed save leaves the edit on screen

A save that fails for any reason other than another writer SHALL leave the edit on screen and the content Failed, never reverting it.

#### Scenario: A failed save leaves the edit on screen as failed

- **GIVEN** a save is in flight
- **WHEN** it fails for a reason other than another writer
- **THEN** the content is Failed
- **AND** nothing is read or reverted

### Requirement: Every transition preserves the invariants

The content sync SHALL preserve, across every event from every state, that a save is started only when none is in flight and is tracked once started, a save in flight is forgotten only by its answer, read content is applied only to an opening with none or one adopting with no edit since, the confirmed version never goes back, and a row at or below that version changes nothing.

#### Scenario: Preserve every invariant from every state across every event

- **GIVEN** every state an opening can be in, with each relation an event can bear to it
- **WHEN** each event is applied to each state
- **THEN** every invariant holds after the transition
