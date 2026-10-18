## Purpose

A Share command on published resources that posts the public link into an esbabbler room you pick.

## Requirements

### Requirement: Share appears only for a published resource

The Share command SHALL appear only for a published resource.

#### Scenario: Unpublished resource

- **GIVEN** a resource is not published
- **WHEN** the owner views its page
- **THEN** no Share command is shown

#### Scenario: Published resource

- **GIVEN** a resource is published
- **WHEN** the owner views its page
- **THEN** the Share command is shown

### Requirement: Sharing posts the public link into a chosen room

Sharing SHALL post a message into the room the owner picks, containing the public link and the optional note the owner wrote.

#### Scenario: Owner shares with a note

- **GIVEN** the owner has opened the Share dialog for a published resource
- **WHEN** the owner picks a room, writes a note and sends
- **THEN** a message with the note and the public link is posted in that room

#### Scenario: Owner shares without a note

- **GIVEN** the owner has opened the Share dialog for a published resource
- **WHEN** the owner picks a room and sends without a note
- **THEN** a message with only the public link is posted in that room

### Requirement: The Share dialog offers only the owner's own rooms

The Share dialog SHALL offer only the rooms the owner belongs to.

#### Scenario: Owner opens the dialog

- **GIVEN** the owner belongs to two rooms
- **WHEN** the owner opens the Share dialog
- **THEN** only those two rooms are offered

### Requirement: The Share dialog explains when there are no rooms

When the owner has no rooms the Share dialog SHALL say so and point to the chat, and SHALL NOT offer a send button that cannot be used.

#### Scenario: Owner has no rooms

- **GIVEN** the owner belongs to no rooms
- **WHEN** the owner opens the Share dialog
- **THEN** the dialog says there are no rooms
- **AND** it points the owner to the chat

### Requirement: The message length limit includes the link

The Share dialog SHALL refuse to send a message whose full text, including the note and the link, exceeds the message length limit.

#### Scenario: Note fits but the message with its link does not

- **GIVEN** the note is within the message length limit on its own
- **WHEN** the note and the link together exceed the limit
- **THEN** the owner cannot send the message
- **AND** the dialog shows that the message is too long

### Requirement: A successful share offers to open the room

After a successful share the owner SHALL see a notice naming the room, with an action that opens the room.

#### Scenario: Share succeeds

- **GIVEN** the owner has shared a resource into a room
- **WHEN** the message is posted
- **THEN** a notice names the room
- **AND** the notice offers Open room

### Requirement: A shared message follows the rules of any message

A shared message SHALL follow the same rules as any message the owner posts in that room, and a share refused by those rules SHALL NOT be posted.

#### Scenario: Owner cannot post in the room

- **GIVEN** the owner is not allowed to post in a room
- **WHEN** the owner tries to share a resource into it
- **THEN** the message is refused as it would be for any message

### Requirement: A shared link stays in the room after the resource is deleted

A shared link SHALL remain in the room after the resource is deleted, and SHALL then lead to a not found page.

#### Scenario: Shared resource is deleted

- **GIVEN** a published resource was shared into a room
- **WHEN** the owner deletes the resource
- **THEN** the message stays in the room
- **AND** following its link shows a not found page
