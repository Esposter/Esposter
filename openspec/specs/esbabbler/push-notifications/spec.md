## Purpose

Who a chat message notifies — the mention rules, the per-room preference, and the thread followers that widen the same recipient set. Delivery itself is covered by the shared notifications spec; this spec covers who is notified and what the notification shows.

## Requirements

### Requirement: A member's room setting decides which messages notify them

A member's notification setting for a room SHALL decide which messages in that room notify them.

#### Scenario: a member set to notify on all messages

- **GIVEN** a member whose setting for the room is All
- **WHEN** another member posts a message in the room
- **THEN** the member is notified

#### Scenario: a member set to notify only on direct mentions

- **GIVEN** a member whose setting for the room is direct mentions only
- **WHEN** a message in the room does not mention the member by name
- **THEN** the member is not notified

#### Scenario: a member who mutes the room

- **GIVEN** a member whose setting for the room is Never
- **WHEN** a message in the room mentions the member directly
- **THEN** the member is not notified

#### Scenario: the sender is not notified of their own message

- **GIVEN** a member who posts a message in a room set to All
- **WHEN** the message is sent
- **THEN** the sender is not notified

### Requirement: An everyone mention notifies every member who has not muted the room

An everyone mention SHALL notify every member whose setting for the room is not Never.

#### Scenario: a message mentions everyone

- **GIVEN** a member who is set to direct mentions only and a member who has muted the room
- **WHEN** a message mentions everyone
- **THEN** the first member is notified
- **AND** the muted member is not notified

### Requirement: A here mention notifies only members who are online

A here mention SHALL notify only members who have not muted the room and who show as online.

#### Scenario: a message mentions here

- **GIVEN** a member showing as online and a member showing as Idle, both not muted
- **WHEN** a message mentions here
- **THEN** the online member is notified
- **AND** the idle member is not notified

### Requirement: A reply also notifies the followers of its thread

A reply SHALL notify the followers of its thread, except the replier and members who have muted the room.

#### Scenario: a reply in a followed thread

- **GIVEN** a member following a thread and a member who has muted the room but follows it
- **WHEN** another member replies in the thread
- **THEN** the follower is notified
- **AND** the muted follower is not notified

### Requirement: A notification shows the author's name and the first line of the message

A notification SHALL show the author's room name and the first line of the message as plain text.

#### Scenario: a message with text

- **GIVEN** a message whose first paragraph is text
- **WHEN** a notification is shown for it
- **THEN** the notification shows the author and that paragraph as plain text

#### Scenario: a message with only an attachment

- **GIVEN** a message whose only content is an attachment
- **WHEN** the message is sent
- **THEN** no notification is shown for it

### Requirement: A reply's notification opens the thread it belongs to

A notification for a reply SHALL open the thread the reply belongs to, not the reply alone.

#### Scenario: a member opens a reply's notification

- **GIVEN** a notification for a reply in a thread
- **WHEN** the member opens the notification
- **THEN** the thread the reply belongs to is opened

### Requirement: A webhook message notifies every member who has not muted the room

A message posted by a webhook SHALL notify every member whose setting for the room is All, including the bot's own account.

#### Scenario: a webhook posts to a room

- **GIVEN** a room with a member set to All and a member who has muted the room
- **WHEN** a webhook posts a message to the room
- **THEN** the member set to All is notified
- **AND** the notification shows the bot's name
