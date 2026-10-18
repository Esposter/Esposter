## Purpose

Unified admin action system — permission-gated actions, word filter, and the append-only audit log. Covers who may act on whom, what each action does to the member and their calls, what the targeted member sees, the word filter's refusals, and the audit log's readers.

## Requirements

### Requirement: A moderation action runs only for a caller holding its permission

A moderation action SHALL run only when the caller holds the permission that action requires.

#### Scenario: a moderator with the permission removes a member

- **GIVEN** a moderator holding the kick members permission and a role above the member
- **WHEN** the moderator kicks the member from the room
- **THEN** the member is removed from the room
- **AND** the member no longer appears in the room's member list

#### Scenario: a member without the permission tries to remove someone

- **GIVEN** a member who does not hold the kick members permission
- **WHEN** the member tries to kick another member
- **THEN** the action is refused

### Requirement: A moderator may act only on members ranked below them

A moderation action SHALL be refused when the target's highest role is not below the caller's, and when the caller targets themselves.

#### Scenario: a moderator targets a member with an equal or higher role

- **GIVEN** a moderator and a member whose highest role is equal to or above the moderator's
- **WHEN** the moderator tries to kick or ban that member
- **THEN** the action is refused

#### Scenario: a member tries to moderate themselves

- **GIVEN** a member holding a moderation permission
- **WHEN** the member targets their own membership with a moderation action
- **THEN** the action is refused

### Requirement: A force mute stops the member's microphone for the call

A force mute SHALL stop the targeted member publishing microphone audio in the room's call until a force unmute restores it.

#### Scenario: a moderator force mutes a participant in a call

- **GIVEN** a participant speaking in a call in the room
- **WHEN** a moderator holding the mute members permission force mutes that participant
- **THEN** the participant's microphone is muted
- **AND** the participant cannot publish microphone audio until a moderator force unmutes them

#### Scenario: a moderator stops a participant's screen share

- **GIVEN** a participant sharing their screen in a call in the room
- **WHEN** a moderator holding the mute members permission stops the share
- **THEN** the participant's screen share ends

### Requirement: A kick from a call takes the member out of every call in the room

A kick from a call SHALL remove the targeted member from every call the room runs, including its thread calls.

#### Scenario: a moderator kicks a participant from a call

- **GIVEN** a participant in a call in the room
- **WHEN** a moderator holding the move members permission kicks them from the call
- **THEN** the participant leaves the call
- **AND** the participant is told they were removed from the call

### Requirement: A kick, ban or soft ban is announced as a departure

A removal from a room SHALL be announced to the room as a member leaving, after the removal has been stored.

#### Scenario: a kicked member leaves the room

- **GIVEN** a member in the room
- **WHEN** a moderator kicks the member
- **THEN** every member's list drops the kicked member
- **AND** the room shows a system line naming the member who left

### Requirement: A timed-out member cannot post or join calls until the timeout ends

A timed-out member SHALL be unable to post in the room or join its calls until the timeout ends.

#### Scenario: a timed-out member tries to post

- **GIVEN** a member whose timeout has not yet ended
- **WHEN** the member sends a message
- **THEN** the send is refused

#### Scenario: a timed-out member tries to join a call

- **GIVEN** a member whose timeout has not yet ended
- **WHEN** the member tries to join a call in the room
- **THEN** the join is refused

#### Scenario: a timeout ends

- **GIVEN** a member whose timeout has passed
- **WHEN** the member sends a message
- **THEN** the message is accepted

### Requirement: A banned user cannot rejoin the room until the ban is lifted

A ban SHALL keep the banned user out of the room and its joins until a moderator lifts it.

#### Scenario: a banned user tries to join

- **GIVEN** a user banned from the room
- **WHEN** the user tries to join the room
- **THEN** the join is refused

#### Scenario: a moderator lifts a ban

- **GIVEN** a user banned from the room
- **WHEN** a moderator holding the ban members permission lifts the ban
- **THEN** the user can join the room again

### Requirement: A soft ban also removes the member's visible messages

A soft ban SHALL ban the user, remove them from the room and its calls, and delete their visible messages.

#### Scenario: a moderator soft bans a member

- **GIVEN** a member with messages visible in the room
- **WHEN** a moderator holding the ban members permission soft bans the member
- **THEN** the member is banned and removed from the room
- **AND** the member's visible messages are deleted

### Requirement: A targeted member is told of an action as it happens

The server SHALL enforce each action whether or not the targeted member's app reacts to the notice.

#### Scenario: the targeted member's app ignores the notice

- **GIVEN** a targeted member whose app does not react to the action
- **WHEN** a moderator kicks the member from a call
- **THEN** the member is still removed from the call

#### Scenario: a warning reaches the targeted member

- **GIVEN** a member in the room
- **WHEN** a moderator warns the member
- **THEN** the member is shown a warning notification

### Requirement: An action that cannot take effect is reported as failed

A moderation action SHALL report failure when its effect at the call server did not take hold.

#### Scenario: the call server cannot apply a mute

- **GIVEN** a call server that refuses the change
- **WHEN** a moderator force mutes a participant
- **THEN** the action fails and is reported as failed rather than as done

### Requirement: Every executed action is recorded in an audit log

Every executed moderation action SHALL be recorded in the room's audit log, which only members managing the room may read.

#### Scenario: a manager reads the audit log

- **GIVEN** a member holding the manage room permission and a log of actions
- **WHEN** the member opens the audit log
- **THEN** the actions are listed newest first
- **AND** the member can filter them by action type, actor and target

#### Scenario: a member without the permission opens the audit log

- **GIVEN** a member who does not hold the manage room permission
- **WHEN** the member asks for the audit log
- **THEN** the request is refused

### Requirement: The word filter refuses a message containing a filtered word

A send that contains a filtered word SHALL be refused, with the configured action applied and the reason shown to the sender.

#### Scenario: a message contains a filtered word

- **GIVEN** a room with a filtered word and a member who may post
- **WHEN** the member sends a message containing that word
- **THEN** the send is refused
- **AND** the member is shown the sentence explaining the word filter stopped the message

### Requirement: A slowmode refusal tells the sender that waiting helps

A send refused by slowmode SHALL tell the sender that the refusal is a rate limit they can wait out.

#### Scenario: a member sends again before slowmode allows it

- **GIVEN** a room with slowmode on and a member who has just sent a message
- **WHEN** the member sends another message before the interval passes
- **THEN** the send is refused as a rate limit
- **AND** the sender is shown that sending again after the interval will succeed

### Requirement: Bans are searched by the banned member's name only

The bans list SHALL match a search against the banned member's name and SHALL NOT match against the reason written for the ban.

#### Scenario: a moderator searches bans by name

- **GIVEN** a room with banned members
- **WHEN** a moderator holding the ban members permission searches by part of a banned member's name
- **THEN** the matching bans are listed

#### Scenario: a moderator searches bans by a reason

- **GIVEN** a ban whose reason contains the search text
- **WHEN** a moderator searches for that text
- **THEN** that ban is not listed

#### Scenario: a moderator clears the search

- **GIVEN** a search that is showing matching bans
- **WHEN** the moderator clears the search field
- **THEN** every ban in the room is listed again
