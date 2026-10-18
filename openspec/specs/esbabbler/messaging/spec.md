## Purpose

How messages are stored in Azure Table Storage, sent through tRPC, and fanned out in real time. The spec covers the send path, what members may post, the operations each message type allows, poll votes, and reading message history.

## Requirements

### Requirement: A send is stored only after the room accepts it

The send path SHALL store a message only when the room's send checks accept it.

#### Scenario: a send that passes every check is stored

- **GIVEN** a member who may post in a room that accepts messages
- **WHEN** the member sends a message
- **THEN** the message is stored and shown to every member connected to the room
- **AND** the room's last-updated time moves to the send

#### Scenario: a send refused by a room rule is not stored

- **GIVEN** a room set to read-only
- **WHEN** a member sends a message
- **THEN** the send is refused
- **AND** no member is shown a message from that send

### Requirement: Members see a message only once it is stored

A message SHALL reach other members only after it has been stored successfully.

#### Scenario: a failed store announces nothing

- **GIVEN** storing a message fails
- **WHEN** the member sends it
- **THEN** no member sees the message

### Requirement: Members may post only regular messages and polls

A member SHALL be able to create only regular messages and polls, while room event lines are written by the room itself.

#### Scenario: a member tries to post a room event line

- **GIVEN** a member of a room
- **WHEN** the member submits a message of a join, call, rename or pin type
- **THEN** the submission is refused

### Requirement: Each message type allows only the operations it declares

A message SHALL accept an edit, delete, pin or vote only when its type supports that operation and the caller is allowed to perform it.

#### Scenario: the author edits their own message

- **GIVEN** a member who wrote a regular message
- **WHEN** the member edits it
- **THEN** the edit is saved

#### Scenario: a moderator removes another member's message

- **GIVEN** a member holding the manage messages permission
- **WHEN** the member deletes another member's regular message
- **THEN** the message is deleted

#### Scenario: a member who is neither the author nor a moderator edits a message

- **GIVEN** a member who did not write a regular message and does not hold the manage messages permission
- **WHEN** the member tries to edit it
- **THEN** the edit is refused

#### Scenario: a room event line cannot be edited by anyone

- **GIVEN** a room event line such as a join or a call summary
- **WHEN** a member holding the manage messages permission tries to edit it
- **THEN** the edit is refused

#### Scenario: a webhook message is changed only by a moderator

- **GIVEN** a message posted by a webhook
- **WHEN** a member without the manage messages permission tries to edit or delete it
- **THEN** the change is refused

### Requirement: A deleted message accepts no further operation

A message its author has deleted SHALL be treated as no longer existing for every later operation on it.

#### Scenario: the author tries to act on a deleted message

- **GIVEN** a message its author has deleted
- **WHEN** the author tries to edit, pin, vote on or forward it
- **THEN** the operation is refused as if the message were absent

### Requirement: A poll vote survives a concurrent vote from another member

A poll vote SHALL be stored without overwriting a vote another member recorded at the same time.

#### Scenario: two members vote on the same poll at once

- **GIVEN** two members voting on the same poll at the same moment
- **WHEN** both votes are stored
- **THEN** both votes are counted

#### Scenario: a vote keeps colliding with other writes

- **GIVEN** a vote that cannot be stored after repeated attempts
- **WHEN** the voter casts it
- **THEN** the vote is refused with a conflict
- **AND** the voter is asked to send the vote again

### Requirement: A poll vote changes only the voter's choice

A vote SHALL leave the poll's question and option labels unchanged.

#### Scenario: the first vote on a labelled poll

- **GIVEN** a poll with labelled options and no votes yet
- **WHEN** a member votes
- **THEN** the question and every option label are unchanged

### Requirement: Message history is listed once per message in the requested order

A history page SHALL list each message at most once, in the order the reader asked for.

#### Scenario: a reader asks for the oldest messages first

- **GIVEN** a room with several messages
- **WHEN** a reader requests the history oldest first
- **THEN** the messages are listed oldest first

#### Scenario: a message not yet readable is skipped and still arrives live

- **GIVEN** a message being sent while a history page is read
- **WHEN** the page is read before that message is readable
- **THEN** the page skips it
- **AND** the sender's live view still shows the message

#### Scenario: a skipped message does not hold the reader's page

- **GIVEN** a history page whose next entry cannot yet be read
- **WHEN** the reader continues paging
- **THEN** the reader moves past that entry rather than requesting the same page again

#### Scenario: a message delivered twice is shown once

- **GIVEN** a member who receives the same message both from a history page and from the live feed
- **WHEN** both deliveries arrive
- **THEN** the message appears once
