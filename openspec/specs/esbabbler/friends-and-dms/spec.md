## Purpose

Bidirectional friend requests, blocking, and 1:1 or group direct messages built on the rooms table.

## Requirements

### Requirement: A friend request becomes a friendship only when it is accepted

A user SHALL be able to send a friend request to another user, and the two SHALL become friends only when the other user accepts it.

#### Scenario: Sending a request

- **GIVEN** two users are not yet friends
- **WHEN** one user sends the other a friend request
- **THEN** the request is pending for the other user

#### Scenario: Accepting a request

- **GIVEN** a friend request is pending
- **WHEN** the receiver accepts it
- **THEN** the two users are friends
- **AND** the request is no longer pending

#### Scenario: Declining a request

- **GIVEN** a friend request is pending
- **WHEN** the receiver declines it
- **THEN** the request is removed
- **AND** the two users are not friends

#### Scenario: Duplicate request does nothing

- **GIVEN** a friend request is already pending from one user to another
- **WHEN** the same user sends another request to that user
- **THEN** there is still a single pending request

#### Scenario: Befriending oneself is refused

- **GIVEN** a user
- **WHEN** they send a friend request to themselves
- **THEN** the request is refused

### Requirement: A user can remove a friend

A user SHALL be able to remove a friend, after which the two users have no relationship.

#### Scenario: Removing a friend

- **GIVEN** two users are friends
- **WHEN** one of them removes the other
- **THEN** they are no longer friends

### Requirement: Blocking prevents friend requests in either direction and hides the blocked user from search

A user SHALL be able to block another user, which prevents friend requests between them in either direction and hides the blocked user from search results.

#### Scenario: Blocking removes a pending request

- **GIVEN** a friend request is pending between two users
- **WHEN** one of them blocks the other
- **THEN** the pending request is removed

#### Scenario: Blocking ends a friendship

- **GIVEN** two users are friends
- **WHEN** one of them blocks the other
- **THEN** they are no longer friends

#### Scenario: Blocked user cannot send a friend request

- **GIVEN** one user has blocked another
- **WHEN** the blocked user sends a friend request
- **THEN** the request is refused

#### Scenario: Blocked user is hidden from search

- **GIVEN** one user has blocked another
- **WHEN** the blocker searches for users
- **THEN** the blocked user does not appear in the results

#### Scenario: Unblocking leaves no relationship

- **GIVEN** one user has blocked another
- **WHEN** the blocker unblocks them
- **THEN** the two users have no relationship and are not friends

### Requirement: Direct messages can only be started with accepted friends

A user SHALL be able to start a direct message only with users who are their accepted friends.

#### Scenario: Starting a direct message with a friend

- **GIVEN** a user has a friend
- **WHEN** they choose the friend in the New Message dialog and confirm
- **THEN** a direct message with that friend is opened

#### Scenario: Starting a group direct message

- **GIVEN** a user has several friends
- **WHEN** they select several of them and confirm
- **THEN** a group direct message with those friends is opened

#### Scenario: Only one direct message per pair of users

- **GIVEN** two users already have a direct message
- **WHEN** either of them starts a direct message with the other
- **THEN** the existing direct message is opened

#### Scenario: Naming a non-friend is refused

- **GIVEN** a user is not friends with another user
- **WHEN** they try to start a direct message with that user
- **THEN** the request is refused

### Requirement: A group direct message is named after its members unless its creator names it

A group direct message SHALL show a generated name listing its members unless its creator has set a name, and a one-to-one direct message SHALL show the other person's current name.

#### Scenario: Unnamed group shows its members

- **GIVEN** a group direct message with Alice and Bob that its creator has not named
- **WHEN** the reader views it
- **THEN** it is named after the reader and the members

#### Scenario: Creator names the group

- **GIVEN** the creator of a group direct message
- **WHEN** they set its name
- **THEN** every member sees that name

#### Scenario: One-to-one name follows a change of name

- **GIVEN** a one-to-one direct message with another user
- **WHEN** that user changes their name
- **THEN** the direct message shows the new name

### Requirement: Closing a direct message hides it without deleting it

Closing a direct message SHALL hide it from the reader's list without deleting it, and it SHALL reappear with its history when its reader is added back to a group.

#### Scenario: Closing a direct message

- **GIVEN** a direct message is in the reader's list
- **WHEN** the reader closes it
- **THEN** it is removed from the reader's list
- **AND** the other members still see it

#### Scenario: Re-added member gets the group back

- **GIVEN** a member has closed a group direct message
- **WHEN** they are added back to that group
- **THEN** the group reappears in their list with its earlier messages

### Requirement: Any group member can leave and only its owner can remove others

Any member of a group direct message SHALL be able to leave it, and only its owner SHALL be able to remove another member.

#### Scenario: Member leaves a group

- **GIVEN** the reader is a member of a group direct message
- **WHEN** they choose Leave Group
- **THEN** the group is removed from their list

#### Scenario: Owner removes a member

- **GIVEN** the reader owns a group direct message
- **WHEN** they remove another member
- **THEN** that member is removed from the group

#### Scenario: Non-owner cannot remove another member

- **GIVEN** the reader is a member but not the owner of a group direct message
- **WHEN** they try to remove another member
- **THEN** the removal is refused

### Requirement: Direct messages are private to their members

Direct messages SHALL NOT be joinable through invite links and SHALL NOT appear in public room discovery.

#### Scenario: Invite link to a direct message is refused

- **GIVEN** someone holds an invite link to a direct message
- **WHEN** they try to join through it
- **THEN** the join is refused

#### Scenario: Direct message absent from public discovery

- **GIVEN** a user browses public rooms
- **WHEN** the list is shown
- **THEN** no direct message appears in it

### Requirement: A new direct message notifies the reader only when they are mentioned

A direct message SHALL notify its reader only when they are mentioned until the reader chooses to be notified of every message.

#### Scenario: Default notification setting

- **GIVEN** a reader has just joined a direct message
- **WHEN** a message is posted that does not mention them
- **THEN** they are not notified

#### Scenario: Reader chooses every message

- **GIVEN** a reader has chosen to be notified of every message in a direct message
- **WHEN** a message is posted that does not mention them
- **THEN** they are notified

### Requirement: A call in a direct message posts a call notice in its thread

Starting a call in a direct message SHALL post a call notice in that direct message.

#### Scenario: Starting a call in a direct message

- **GIVEN** a user is in a direct message
- **WHEN** they start a call
- **THEN** a call notice is posted in the direct message
