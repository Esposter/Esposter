## Purpose

Server-backed /remind and /schedule — a stored job plus scheduled delivery that posts at the set time. Covers when a reminder or message fires, how it is delivered at most once, how the creator cancels, reschedules or sends it early, and what a delivery does when a room rule blocks it.

## Requirements

### Requirement: A reminder notifies its creator at the scheduled time

A scheduled reminder SHALL notify its creator at the time they set.

#### Scenario: a reminder comes due

- **GIVEN** a reminder a member scheduled for a set time
- **WHEN** that time arrives
- **THEN** the member is notified with the reminder's text

#### Scenario: a reminder set far in the future

- **GIVEN** a reminder scheduled several months ahead
- **WHEN** that time arrives
- **THEN** the member is notified at that time

#### Scenario: a cancelled reminder

- **GIVEN** a reminder its creator has cancelled
- **WHEN** its set time arrives
- **THEN** no notification is sent

### Requirement: A scheduled message is posted to its room at the scheduled time

A scheduled message SHALL be posted to its room at the time the creator set, as the creator.

#### Scenario: a scheduled message comes due

- **GIVEN** a message a member scheduled for a room
- **WHEN** the set time arrives
- **THEN** the message is posted to the room as the member

#### Scenario: a scheduled message from a thread

- **GIVEN** a message a member scheduled from a thread
- **WHEN** the set time arrives
- **THEN** the message is posted into that thread

#### Scenario: a room rule blocks delivery

- **GIVEN** a scheduled message whose room has become read-only by the time it is due
- **WHEN** the set time arrives
- **THEN** the message is not posted
- **AND** the job is retried later rather than dropped

### Requirement: A scheduled message is posted at most once

A scheduled message SHALL be posted at most once, even when its delivery is attempted more than once.

#### Scenario: delivery is attempted twice

- **GIVEN** a scheduled message whose delivery is attempted by two deliveries at once
- **WHEN** both attempts run
- **THEN** the message is posted once

### Requirement: A word filter block cancels the job instead of retrying it

A scheduled message blocked by the word filter SHALL be cancelled and SHALL NOT be retried.

#### Scenario: a scheduled message contains a filtered word

- **GIVEN** a scheduled message containing a word the room filters
- **WHEN** the set time arrives
- **THEN** the message is not posted
- **AND** the job is cancelled
- **AND** the room's configured action is applied once

### Requirement: The creator may cancel, reschedule or send early until delivery begins

The creator SHALL be able to cancel, reschedule or send a scheduled message now, and only before its delivery has begun.

#### Scenario: a creator cancels before the set time

- **GIVEN** a scheduled message not yet due
- **WHEN** the creator cancels it
- **THEN** the message is never posted

#### Scenario: a creator sends it now

- **GIVEN** a scheduled message not yet due
- **WHEN** the creator chooses to send it now
- **THEN** the message is posted once
- **AND** the scheduled copy is not posted later

#### Scenario: a creator sends it now but a room rule refuses

- **GIVEN** a scheduled message in a room that refuses it at this moment
- **WHEN** the creator chooses to send it now
- **THEN** the send is refused
- **AND** the message stays scheduled

#### Scenario: a creator cancels a message whose delivery has begun

- **GIVEN** a scheduled message whose delivery has already begun
- **WHEN** the creator tries to cancel or reschedule it
- **THEN** the change is refused

#### Scenario: a send-now fails after the scheduled copy was consumed

- **GIVEN** a send-now that fails to post
- **WHEN** the failure occurs
- **THEN** the message is scheduled again rather than lost

### Requirement: A member may schedule only into a room they may post in

A member SHALL be unable to schedule a message into a room where they could not post it now.

#### Scenario: a member schedules into a read-only room

- **GIVEN** a member in a room that is read-only
- **WHEN** the member tries to schedule a message there
- **THEN** the scheduling is refused

### Requirement: A member sees their scheduled items across all rooms

A member SHALL see their own scheduled items from every room in one list, with a count for the tab.

#### Scenario: a member opens the scheduled tab

- **GIVEN** a member with scheduled items in several rooms
- **WHEN** the member opens the scheduled tab
- **THEN** every item is listed with its room and time
- **AND** the tab shows how many items are scheduled
