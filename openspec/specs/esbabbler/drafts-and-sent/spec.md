## Purpose

Cross-room view of unsent drafts, scheduled jobs, and sent messages at /messages/draftsandsent.

## Requirements

### Requirement: One page lists drafts, scheduled messages and sent messages across rooms

The drafts and sent page SHALL list the reader's unsent drafts, scheduled messages and sent messages from every room in three tabs.

#### Scenario: Drafts tab

- **GIVEN** the reader has unsent drafts in several rooms
- **WHEN** they open the Drafts tab
- **THEN** each draft is listed with its room
- **AND** the most recently updated draft is listed first

#### Scenario: Scheduled tab

- **GIVEN** the reader has scheduled messages
- **WHEN** they open the Scheduled tab
- **THEN** the soonest scheduled message is listed first
- **AND** the messages are grouped under Today, Yesterday or their date

#### Scenario: Sent tab

- **GIVEN** the reader has sent messages
- **WHEN** they open the Sent tab
- **THEN** the most recently sent message is listed first
- **AND** the messages are grouped under Today, Yesterday or their date

### Requirement: A sent message links back to its place in its room

Selecting a sent message SHALL take the reader to that message in the room it was sent in.

#### Scenario: Opening a sent message

- **GIVEN** the reader is on the Sent tab
- **WHEN** they select a sent message
- **THEN** the room opens at that message

### Requirement: Draft and scheduled rows offer their own actions

Each draft and scheduled row SHALL offer the actions that apply to it.

#### Scenario: Deleting a draft asks first

- **GIVEN** a draft row is shown
- **WHEN** the reader chooses to delete the draft
- **THEN** a confirmation dialog opens
- **AND** the draft is kept until the reader confirms

#### Scenario: Draft actions

- **GIVEN** a draft row is shown
- **WHEN** the reader hovers over the row
- **THEN** actions to delete, edit, schedule and send the draft are offered

#### Scenario: Scheduled row actions

- **GIVEN** a scheduled row is shown
- **WHEN** the reader hovers over the row
- **THEN** actions to edit, reschedule and send the message are offered
- **AND** a more menu offers cancelling the schedule, saving to drafts and deleting the message

### Requirement: Rooms with drafts are marked in the room list

The room list SHALL mark each room that has a draft with a pencil and show its name in bold.

#### Scenario: Room with a draft

- **GIVEN** a room has an unsent draft
- **WHEN** the room list is shown
- **THEN** the room carries a pencil marker
- **AND** the room's name is shown in bold

### Requirement: Content that sanitizes to nothing removes the draft

A draft whose content sanitizes to nothing SHALL be removed rather than kept as an empty draft.

#### Scenario: Composer cleared to nothing

- **GIVEN** a room has a draft
- **WHEN** the reader clears the composer so that nothing remains after sanitizing
- **THEN** the room's draft is removed
- **AND** the room no longer appears on the Drafts tab or carries a pencil marker

### Requirement: Autosave never rewrites the text being typed

Autosaving a draft SHALL NOT change the text the reader is typing in the composer.

#### Scenario: Autosave while typing

- **GIVEN** the reader is typing in a room's composer
- **WHEN** the draft autosaves
- **THEN** the composer text is not rewritten under the reader's cursor

### Requirement: Drafts survive a reload on the same device

Drafts SHALL be restored after the app is reloaded on the device where they were written.

#### Scenario: Reload restores drafts

- **GIVEN** the reader has drafts in several rooms
- **WHEN** the app is reloaded on that device
- **THEN** the same drafts are listed on the Drafts tab and marked in the room list
