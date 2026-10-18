## Purpose

One notification concept — a typed event published once, delivered by one Function, fanned out to the surfaces its type declares.

## Requirements

### Requirement: One path carries every notification

Every event that tells a person something happened SHALL travel one path: a single typed publish, one delivery function, and fan-out to the surfaces its type declares.

#### Scenario: A mutation raises a notification

- **GIVEN** a mutation should tell a person something happened
- **WHEN** the mutation completes
- **THEN** it publishes one typed notification event
- **AND** the notification is delivered through the same path as every other notification

#### Scenario: A new notification type is added

- **GIVEN** a new notification type is added
- **WHEN** it is delivered
- **THEN** it uses the existing delivery path without a new delivery function or event subscription

### Requirement: A publisher states what happened and who it concerns

A publisher SHALL state what happened and who it concerns, and delivery SHALL resolve the wording, the destination and the recipients.

#### Scenario: A reply is posted in a followed thread

- **GIVEN** a thread has followers
- **WHEN** a reply is posted in it
- **THEN** one notification event is raised
- **AND** the followers are added to the recipients of that event rather than receiving a second notification

### Requirement: Each notification type declares its surfaces

Every notification type SHALL declare which surfaces it reaches, the bell or the device push, and no type SHALL inherit a default.

#### Scenario: A chat message arrives in a room

- **GIVEN** a chat message is posted in a room
- **WHEN** it is delivered
- **THEN** it reaches the device push
- **AND** it does not add a bell entry, because the room already shows its own unread count

#### Scenario: A new type is added without declaring its surfaces

- **GIVEN** a new notification type is added
- **WHEN** the typecheck runs
- **THEN** the typecheck fails until the type declares its surfaces and its severity

### Requirement: The bell keeps a bounded history per recipient

The bell SHALL keep only notifications within a fixed retention window for each recipient.

#### Scenario: A bell entry is written

- **GIVEN** a recipient has bell entries older than the retention window
- **WHEN** a new bell entry is written for that recipient
- **THEN** the entries older than the retention window are removed

#### Scenario: The retention removal fails

- **GIVEN** removing old bell entries fails
- **WHEN** the delivery finishes
- **THEN** the notification counts as delivered
- **AND** the delivery is not retried, so no entry is written twice

### Requirement: A resource operation reaches every other device but the originating one

A resource operation's device push SHALL reach every other device of the same user and SHALL NOT reach the session that caused the operation.

#### Scenario: A user changes a resource in one tab

- **GIVEN** a user has the app open on two devices and in two tabs
- **WHEN** an operation is performed in one tab
- **THEN** the tab that performed it shows its own feedback
- **AND** every other device of that user receives the push

### Requirement: Accepted notification events are retried and dead-lettered by the event system

A notification event accepted by the event system SHALL be retried, and any delivery that exhausts its retries SHALL be dead-lettered so it can be replayed.

#### Scenario: A delivery exhausts its retries

- **GIVEN** a delivery of an accepted notification keeps failing
- **WHEN** its retries are exhausted
- **THEN** the event is dead-lettered
- **AND** an operator can replay it

#### Scenario: A reminder is delivered

- **GIVEN** a reminder is due
- **WHEN** it is delivered
- **THEN** it is published as an event like every other notification and is not sent inline

#### Scenario: A publish fails before the event system accepts it

- **GIVEN** a publish fails before the event system accepts the event
- **WHEN** the failure happens
- **THEN** the publisher logs an error
- **AND** nothing is retried or dead-lettered, because there is no accepted event

### Requirement: A device subscription the push service reports gone is removed

When the push service reports a device subscription as gone, the subscription SHALL be removed so that no later push is sent to it.

#### Scenario: The push service reports a subscription gone

- **GIVEN** a stored device subscription exists
- **WHEN** the push service responds that the subscription is gone
- **THEN** the subscription is deleted
