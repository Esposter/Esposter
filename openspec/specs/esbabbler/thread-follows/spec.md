## Purpose

Follow a thread to be notified on new replies, with a Followed Threads drawer to find them again. Covers when a member follows a thread automatically, how an unfollow holds, who is notified of a reply, and what the Followed Threads list shows.

## Requirements

### Requirement: Replying follows the thread for the replier and the root message's author

A reply SHALL make the replier and the author of the root message followers of that thread.

#### Scenario: a member replies to a thread

- **GIVEN** a member who has not followed a thread
- **WHEN** the member replies in the thread
- **THEN** the member follows the thread

#### Scenario: the author of the root message

- **GIVEN** a root message whose author has not unfollowed the thread
- **WHEN** another member replies in the thread
- **THEN** the root message's author follows the thread

#### Scenario: a reply to a webhook message

- **GIVEN** a root message posted by a webhook, which has no member author
- **WHEN** a member replies to it
- **THEN** the reply is posted
- **AND** no follow is made for the root message's author

### Requirement: A member may follow or unfollow a thread from its menu

A member SHALL be able to turn reply notifications for a thread on or off from the thread's menu.

#### Scenario: a member turns notifications off

- **GIVEN** a member following a thread
- **WHEN** the member turns reply notifications off from the thread's menu
- **THEN** the member no longer receives notifications for replies in that thread

### Requirement: A member's unfollow holds against other members' replies

A recorded unfollow SHALL hold against replies by other members, and SHALL be cleared only when the member follows the thread or replies in it themselves.

#### Scenario: another member replies to a thread the root author unfollowed

- **GIVEN** a root message's author who has unfollowed the thread
- **WHEN** another member replies in the thread
- **THEN** the root message's author does not follow the thread again

#### Scenario: the unfollowing member replies themselves

- **GIVEN** a member who has unfollowed a thread
- **WHEN** the member replies in the thread
- **THEN** the member follows the thread again

### Requirement: Each reply notifies the thread's followers once

A reply SHALL notify the thread's followers, except the replier and members who have set the room to Never, and each follower SHALL receive one notification.

#### Scenario: a reply in a thread with several followers

- **GIVEN** a thread with three followers, one of whom has set the room to Never
- **WHEN** a member replies
- **THEN** the two followers who have not muted the room each receive one notification
- **AND** the muted follower receives none

#### Scenario: a follower opens the reply's notification

- **GIVEN** a follower's notification for a reply
- **WHEN** the follower opens it
- **THEN** the thread is opened

### Requirement: The Followed Threads list shows each followed thread once and omits deleted ones

The Followed Threads list SHALL show each thread the member follows once, newest activity first, and SHALL omit a thread whose root message has been deleted.

#### Scenario: a member opens Followed Threads

- **GIVEN** a member following several threads, one of whose root was deleted
- **WHEN** the member opens Followed Threads
- **THEN** each remaining thread is listed once, newest first
- **AND** the thread with the deleted root is not listed
