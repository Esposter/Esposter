## Purpose

Anything a client could lie about is decided on the server — its own reaction to an event is a courtesy, never the enforcement.

## Requirements

### Requirement: A call removal takes effect on the server for every call in the room

A moderator's removal of a member from a room SHALL take effect on the server for every call the room runs, whatever the member's own client does.

#### Scenario: A kick removes the member from every call

- **GIVEN** a member who is in more than one call in a room
- **WHEN** a moderator kicks the member from the room
- **THEN** the member is removed from every call the room runs

#### Scenario: A removed member reconnects

- **GIVEN** a member who was removed from a room while holding a call token that has not expired
- **WHEN** the member's client tries to join a call in that room again
- **THEN** the connection is refused because the room no longer admits the member

### Requirement: Forced mute and forced stop of screen share are enforced at the media server

Forced mute and forced stop of screen share SHALL revoke the member's publishing at the media server, not only in the member's client.

#### Scenario: A forced mute on a member whose client keeps sending audio

- **GIVEN** a member whose client keeps trying to send audio after a moderator's forced mute
- **WHEN** the member's audio is published
- **THEN** the media server does not accept it

### Requirement: Only the server writes room system lines

Room system lines for joins, leaves, calls, pins and renames SHALL be written only by the server, and a member SHALL be able to post only messages and polls.

#### Scenario: A member tries to post a system line

- **GIVEN** a member who submits a message of a type reserved for system lines
- **WHEN** the submission is made
- **THEN** the post is refused

### Requirement: A system line shows member names as plain text

A room system line SHALL show member names as plain text, never as markup.

#### Scenario: A member name containing markup

- **GIVEN** a member whose name contains markup characters
- **WHEN** a system line names that member
- **THEN** the name is shown exactly as typed, with no markup applied

### Requirement: The typing indicator shows the name held on the membership

The typing indicator SHALL show the name stored on the member's own membership, so that no member can appear to type under another member's name.

#### Scenario: A member starts typing

- **GIVEN** a member in a room
- **WHEN** the member types in the room
- **THEN** the typing indicator shows the name stored on that member's membership

### Requirement: Anonymous callers are limited by the address the platform records

Rate limiting for anonymous callers SHALL use the address the platform records for the connection, never an address the caller supplies.

#### Scenario: A caller supplies a forged address

- **GIVEN** an anonymous caller that sends its own address in a request header
- **WHEN** its requests are rate limited
- **THEN** the limit is applied to the address the platform recorded

### Requirement: A public read of an external service is answered once per server process

A public read that calls an external service SHALL answer from one fetch per server process, so that callers cannot use up the external service's quota.

#### Scenario: Many callers read the build version

- **GIVEN** many callers requesting the build version
- **WHEN** they all read it within one server process
- **THEN** the external service is called once for that process
