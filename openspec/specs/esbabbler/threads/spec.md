## Purpose

The thread pane — a live view of a message's replies with its own composer, call, split view and popped-out window. Covers opening a thread, what the pane shows as replies arrive, the composer and drafts, the thread menu, calls inside a thread, and the thread's own link.

## Requirements

### Requirement: Opening a thread shows its message and replies in a live side pane

Opening a thread SHALL open a side pane showing the root message and its replies, which updates as replies arrive.

#### Scenario: a member opens a thread from a message

- **GIVEN** a message with replies
- **WHEN** the member chooses View Thread on the message
- **THEN** the thread pane opens at once
- **AND** placeholder rows show until the replies have loaded

#### Scenario: a reply arrives while the thread is open

- **GIVEN** a thread open in the pane
- **WHEN** another member replies in it
- **THEN** the reply appears in the pane as it arrives

#### Scenario: the member opens a second thread before the first has loaded

- **GIVEN** a thread still loading after the member opened it
- **WHEN** the member opens a different thread
- **THEN** only the second thread is shown when it loads

#### Scenario: the root message is deleted while its thread is open

- **GIVEN** a thread open in the pane
- **WHEN** its root message is deleted
- **THEN** the pane closes

### Requirement: The thread composer offers the same reply features as the room composer

The thread pane's composer SHALL offer rich text, mentions, emoji, and attachments, and SHALL leave room-only commands to the room composer.

#### Scenario: a member attaches a file to a reply

- **GIVEN** a member with the thread pane open
- **WHEN** the member drops a file anywhere in the pane
- **THEN** the file is attached to the reply, not to the room

#### Scenario: a member looks for slash commands in the thread

- **GIVEN** a member typing a slash in the thread composer
- **WHEN** the picker would open in the room composer
- **THEN** no slash command picker is offered in the thread composer

### Requirement: A reply in progress is kept as a draft for its thread

A reply a member has started SHALL be kept as a draft for its thread, restored on reload and listed among the member's drafts.

#### Scenario: a member leaves a half-written reply

- **GIVEN** a member with text typed into the thread composer
- **WHEN** the member reloads the app
- **THEN** the text is still in the thread composer

#### Scenario: a member schedules a reply from a thread

- **GIVEN** a message a member scheduled from a thread
- **WHEN** its time arrives
- **THEN** the message is posted into that thread

### Requirement: The thread menu acts on the thread as a whole

The thread menu SHALL offer a reply notification toggle, copy link, a call in the thread, split view, and opening the thread in a new window.

#### Scenario: a member copies the thread's link

- **GIVEN** a thread open in the pane
- **WHEN** the member chooses Copy link from the thread menu
- **THEN** the link to the root message is copied

#### Scenario: a member opens the thread in a new window

- **GIVEN** a thread open in the pane
- **WHEN** the member chooses Open in new window
- **THEN** a new window opens showing the thread with its pane open

### Requirement: A thread can hold its own call alongside the room's call

A thread SHALL be able to hold its own call while the room runs its own call.

#### Scenario: a call started in a thread while the room has a call

- **GIVEN** a room with a call in progress
- **WHEN** a member starts a call in a thread
- **THEN** the thread's call starts without ending the room's call

### Requirement: Split view keeps the previous side pane beside the thread

Split view SHALL keep the side pane that was showing before the thread opened, beside the thread.

#### Scenario: a member opens split view

- **GIVEN** the member list showing in the side pane
- **WHEN** the member opens a thread in split view
- **THEN** the member list stays beside the thread

#### Scenario: a member closes the thread in split view

- **GIVEN** a thread open beside the member list
- **WHEN** the member closes the thread
- **THEN** the member list remains showing

### Requirement: A thread link opens the room with that thread open

A link to a thread SHALL open the room with the thread's pane open on that thread.

#### Scenario: a member follows a thread link

- **GIVEN** a link to a thread in a room the member can read
- **WHEN** the member opens the link
- **THEN** the room opens with the thread's pane showing that thread
