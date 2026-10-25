## REMOVED Requirements

### Requirement: Room attachments and game saves are not counted

**Reason**: a message attachment is now charged to its uploader, so the requirement's first half no longer holds. The replacement below keeps the rest.

## ADDED Requirements

### Requirement: Avatars, room images and game saves are not counted

Avatars, room images and game save files SHALL NOT count against the storage allowance.

#### Scenario: Room image uploaded

- **GIVEN** a user uploads a room image
- **WHEN** the upload completes
- **THEN** the user's storage allowance does not change

### Requirement: A message attachment is charged to the uploader's allowance

A message attachment SHALL count against the storage allowance of the user who uploaded it, at its declared size while the upload is pending and at its stored size once storage reports it.

#### Scenario: Attachment uploaded within the allowance

- **GIVEN** a user whose allowance holds a file of a given size
- **WHEN** the user uploads that file to a room and the upload completes
- **THEN** the allowance rises by the file's stored size
- **AND** the user's storage meter updates without a reload

#### Scenario: Attachment refused over the allowance

- **GIVEN** a user whose allowance cannot hold a file of a given size
- **WHEN** the user asks for a write target for that file
- **THEN** the request is refused with the quota message
- **AND** no write target is returned and the allowance does not change

### Requirement: A forwarded attachment is charged to the forwarder

A forward that copies a message's attachments SHALL charge each copy to the user who forwarded the message before the copy is written. A forward is never refused for that charge, since the copy is already the server's own write.

#### Scenario: Forwarded attachment is copied and charged

- **GIVEN** a message with an attachment that the forwarder's allowance can hold
- **WHEN** the forwarder forwards the message to another room
- **THEN** the copy is written to the destination room
- **AND** the forwarder's allowance rises by the attachment's size

#### Scenario: A failed copy gives its charge back

- **GIVEN** a forward whose copy of an attachment fails
- **WHEN** the copy fails
- **THEN** the forwarder's allowance returns to its value before the copy
- **AND** the forward fails with no copy left in the destination room
