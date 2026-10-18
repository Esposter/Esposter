## Purpose

Client architecture of the chat message list — a plain column-reverse scroller, per-item weight budget, single-instance hover bar and dialogs, lazily built emoji index.

## Requirements

### Requirement: The newest message sits at the bottom of the list

The message list SHALL show the newest message at the bottom and SHALL start there when a room is opened.

#### Scenario: Opening a room

- **GIVEN** a room with several messages
- **WHEN** the reader opens the room
- **THEN** the newest message is at the bottom of the list
- **AND** the list starts scrolled to that message

### Requirement: Hovering a message reveals one action bar

Hovering a message SHALL reveal a single action bar with quick reactions, an emoji picker and the message's actions.

#### Scenario: Hover reveals the bar

- **GIVEN** a message is in the list
- **WHEN** the reader hovers over it
- **THEN** the action bar appears with quick reactions, an emoji picker and the main actions

#### Scenario: More menu holds the remaining actions

- **GIVEN** the action bar is showing
- **WHEN** the reader opens its More menu
- **THEN** it offers the message's updates, its other actions and delete

#### Scenario: Pointer can move from the message to the bar

- **GIVEN** the action bar is showing for a message
- **WHEN** the reader moves the pointer from the message onto the bar
- **THEN** the bar stays visible

### Requirement: Right-clicking a message opens its action menu at that point

A right-click, a long press or the menu key on a message SHALL open the message's action menu at that point, with the same actions as its More menu.

#### Scenario: Right-click opens the menu

- **GIVEN** a message is in the list
- **WHEN** the reader right-clicks it
- **THEN** the message's action menu opens at the pointer

#### Scenario: Long press opens the menu on touch

- **GIVEN** the reader is on a touch screen
- **WHEN** they long-press a message
- **THEN** the message's action menu opens at that point

### Requirement: Deleting or pinning a message asks for confirmation first

Deleting or pinning a message SHALL ask the reader to confirm before it happens.

#### Scenario: Delete asks first

- **GIVEN** the reader chooses to delete a message
- **WHEN** the confirmation appears
- **THEN** the message is kept until the reader confirms

#### Scenario: Cancelling a delete keeps the message

- **GIVEN** the delete confirmation is showing
- **WHEN** the reader cancels it
- **THEN** the message remains in the room

#### Scenario: Pin asks first

- **GIVEN** the reader chooses to pin a message
- **WHEN** the confirmation appears
- **THEN** the message is not pinned until the reader confirms

### Requirement: Each kind of message renders in a shared layout or, for a poll, its own card

Each kind of message SHALL render in a shared layout, an authored body or a system line with an icon and a timestamp, or, for a poll, in its own card.

#### Scenario: Authored messages share one body

- **GIVEN** a message is written by a member or a webhook
- **WHEN** it is shown
- **THEN** it renders in the authored layout with its rich text

#### Scenario: System notices share the system line

- **GIVEN** a message is a call, room change, pin or system notice
- **WHEN** it is shown
- **THEN** it renders as a single line with an icon, its timestamp and its reactions

#### Scenario: Poll has its own card

- **GIVEN** a message is a poll
- **WHEN** it is shown
- **THEN** it renders as a poll card

### Requirement: A forwarded message keeps the same body behaviour as an ordinary message

A forwarded message SHALL show a Forwarded label and SHALL keep the edited marker and editing behaviour of an ordinary message.

#### Scenario: Edited forwarded message

- **GIVEN** a forwarded message has been edited
- **WHEN** it is shown
- **THEN** it shows the edited marker beside its text

#### Scenario: Editing a forwarded message

- **GIVEN** the reader is the author of a forwarded message
- **WHEN** they choose to edit it
- **THEN** the message can be edited as an ordinary message can

### Requirement: Secondary text follows the app's theme

Secondary text in system lines SHALL follow the app's theme colours.

#### Scenario: Switching theme

- **GIVEN** a system line is shown
- **WHEN** the reader switches the app's theme
- **THEN** its secondary text follows the new theme colours

### Requirement: The list keeps one action bar for all its messages

The message list SHALL show at most one action bar at a time rather than one per message.

#### Scenario: Moving across messages

- **GIVEN** the reader moves the pointer from one message to another
- **WHEN** the action bar follows the pointer
- **THEN** only one action bar is on screen at a time
