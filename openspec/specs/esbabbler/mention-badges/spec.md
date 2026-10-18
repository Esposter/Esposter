## Purpose

Mention-only unread counts — red chips on sidebar room items that clear on room view.

## Requirements

### Requirement: The room list shows a red count of unread mentions

The room list SHALL show a red count chip on each room where the reader has unread mentions, and the chip SHALL take precedence over the plain unread marker.

#### Scenario: Mention adds a chip

- **GIVEN** a room the reader is not viewing
- **WHEN** a message mentions the reader
- **THEN** the room shows a red chip with the number of unread mentions

#### Scenario: Chip replaces the unread marker

- **GIVEN** a room has unread messages and unread mentions
- **WHEN** the room list is shown
- **THEN** the red mention chip is shown in place of the unread marker

### Requirement: Opening a room clears its mention count

Opening a room SHALL clear the reader's mention count for that room, and clearing again SHALL change nothing.

#### Scenario: Viewing a room clears its chip

- **GIVEN** a room shows a mention chip
- **WHEN** the reader opens the room
- **THEN** the chip disappears

#### Scenario: Clearing an already clear room changes nothing

- **GIVEN** a room has no unread mentions
- **WHEN** the reader opens it
- **THEN** no change is shown in the room list

#### Scenario: Mention arriving while the room is open

- **GIVEN** the reader is viewing a room
- **WHEN** a message mentions the reader there
- **THEN** no chip is shown for that room in the list
- **AND** the mention count is cleared the next time the reader opens the room

### Requirement: A mention is counted for each member it reaches and never for the sender

A message's mentions SHALL add to the count of every member they reach, and SHALL NOT add to the sender's own count.

#### Scenario: Direct mention is always counted

- **GIVEN** a member is mentioned by name in a message
- **WHEN** the message is sent
- **THEN** the member's mention count goes up whatever their notification settings

#### Scenario: Role mention counts for every member with the role

- **GIVEN** a role is mentioned in a message
- **WHEN** the message is sent
- **THEN** each member who holds the role has their mention count go up

#### Scenario: Everyone mention respects notification settings

- **GIVEN** a message mentions everyone
- **WHEN** it is sent
- **THEN** the mention count goes up only for members whose notification settings allow it

#### Scenario: Here mention counts only online members

- **GIVEN** a message mentions here
- **WHEN** it is sent
- **THEN** the mention count goes up only for members who are online
- **AND** a member with no recorded status counts as online

#### Scenario: Sender is never counted

- **GIVEN** the sender of a message mentions themselves
- **WHEN** the message is sent
- **THEN** the sender's mention count does not go up

### Requirement: A member who has turned off everyone and here mentions is not counted for them

A member whose notification setting is Never SHALL NOT have everyone or here mentions counted for them.

#### Scenario: Never setting skips everyone mentions

- **GIVEN** a member's notification setting is Never
- **WHEN** a message mentions everyone
- **THEN** the member's mention count does not go up

### Requirement: A failed mention count never stops the message from being sent

A failure to count a mention SHALL NOT stop the message from being sent or delivered.

#### Scenario: Count update fails

- **GIVEN** a message mentions the reader
- **WHEN** updating the reader's mention count fails
- **THEN** the message is still sent and shown to everyone
- **AND** the reader's mention chip is not shown for that message

### Requirement: Mention counts change in the room list as they change

The room list SHALL update each room's mention count live when it changes, without the reader reloading.

#### Scenario: Count changes while another room is open

- **GIVEN** the reader is viewing one room
- **WHEN** a mention arrives in another room
- **THEN** that room's chip appears in the room list without a reload

#### Scenario: Count clears while the room list is open

- **GIVEN** a room's chip is showing in the room list
- **WHEN** the reader opens that room
- **THEN** the chip disappears from the list without a reload
