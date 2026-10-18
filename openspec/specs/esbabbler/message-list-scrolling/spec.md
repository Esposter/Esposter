## Purpose

Where the message list is anchored — the present sentinel, the loaded window against the live tail, jump-to-present, and anchor compensation when newer pages load.

## Requirements

### Requirement: The reader is in the present only when the newest message is close and the window is live

The message list SHALL treat the reader as being in the present only while the newest message is within one screen of them and no newer messages remain unloaded.

#### Scenario: A small scroll back is still the present

- **GIVEN** the reader is at the newest message
- **WHEN** they scroll back by less than a screen
- **THEN** the reader is still in the present

#### Scenario: A screen back is browsing history

- **GIVEN** the reader is at the newest message
- **WHEN** they scroll back by a full screen
- **THEN** a notice reads You're Viewing Older Messages

#### Scenario: Deep link into older messages

- **GIVEN** the reader opened a message link and the newer messages are not loaded
- **WHEN** the reader is at the bottom of the loaded messages
- **THEN** the notice reads You're Viewing Older Messages

### Requirement: The jump to present control stays until it is used

The jump-to-present control SHALL appear whenever the reader is not in the present and SHALL stay until the reader uses it or returns to the present.

#### Scenario: Control stays while in the past

- **GIVEN** the reader is viewing older messages
- **WHEN** time passes without the reader acting
- **THEN** the jump-to-present control stays on screen

#### Scenario: Jump when newer messages are unloaded

- **GIVEN** newer messages are not loaded
- **WHEN** the reader presses Jump to Present
- **THEN** the room reloads with its newest messages

#### Scenario: Jump when the newest messages are already loaded

- **GIVEN** the newest messages are loaded and the reader has scrolled back
- **WHEN** the reader presses Jump to Present
- **THEN** the list scrolls to the newest message
- **AND** the pages the reader has already read remain loaded

### Requirement: The notice reflects the reader's real position after a jump

After a jump the present-state notice SHALL reflect the reader's actual position in the new list rather than the position of the list they left.

#### Scenario: Notice clears after a jump

- **GIVEN** the reader pressed Jump to Present
- **WHEN** the newest messages are on screen
- **THEN** the notice disappears at once

### Requirement: Loading newer messages does not move what the reader is looking at

Loading newer messages SHALL NOT move the message the reader is looking at.

#### Scenario: Newer page loads while the reader is scrolled back

- **GIVEN** the reader is looking at a message in the past
- **WHEN** a newer page of messages loads above it
- **THEN** the message the reader is looking at stays in the same place on screen

#### Scenario: No correction while the reader is scrolling

- **GIVEN** the reader is actively scrolling
- **WHEN** a newer page of messages loads
- **THEN** the list does not adjust the reader's position during the scroll

### Requirement: The list follows new messages only while the reader is in the present

A reader in the present SHALL follow new messages to the bottom, and a reader in the past SHALL NOT be moved by them.

#### Scenario: New message arrives while in the present

- **GIVEN** the reader is at the newest message
- **WHEN** a new message arrives
- **THEN** the list stays at the bottom with the new message in view

#### Scenario: New message arrives while in the past

- **GIVEN** the reader is viewing older messages
- **WHEN** a new message arrives
- **THEN** the reader's position does not change

### Requirement: Opening a message link highlights and scrolls to that message

Opening a message link SHALL highlight that message and scroll to it, loading the room around it when the message is not yet loaded.

#### Scenario: Message already loaded

- **GIVEN** the message is already loaded in the room
- **WHEN** the reader opens its link
- **THEN** the message is scrolled into view and highlighted

#### Scenario: Message not yet loaded

- **GIVEN** the message is not loaded
- **WHEN** the reader opens its link
- **THEN** the room opens around that message
- **AND** the message is scrolled into view and highlighted

#### Scenario: Highlight fades on its own

- **GIVEN** a message has been highlighted from a link
- **WHEN** a short time passes
- **THEN** the highlight is removed

### Requirement: Surfaces that need the present state read the list's answer

Any surface that needs to know whether the reader is in the present SHALL use the list's shared answer rather than measuring its own.

#### Scenario: New surface asks whether the reader is in the present

- **GIVEN** a new surface needs to know whether the reader is in the present
- **WHEN** it reads that state
- **THEN** it gets the same answer the list's jump-to-present control uses
