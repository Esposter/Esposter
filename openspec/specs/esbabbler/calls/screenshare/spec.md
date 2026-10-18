## Purpose

LiveKit screen-share tracks, the presenter layout, and moderation enforcement.

## Requirements

### Requirement: A participant can start and stop sharing a window, tab or monitor

A participant SHALL be able to share a window, tab or monitor with the call and SHALL be able to stop sharing at any time.

#### Scenario: Starting a share

- **GIVEN** the participant is not sharing
- **WHEN** they press Share Screen
- **THEN** the browser's screen picker opens
- **AND** choosing a window, tab or monitor shares it with everyone in the call

#### Scenario: Sharing the audio of the shared surface

- **GIVEN** the participant ticks Share audio in the browser's picker
- **WHEN** the share starts
- **THEN** the shared audio is heard by everyone in the call

#### Scenario: Cancelling the picker

- **GIVEN** the screen picker is open
- **WHEN** the participant cancels it
- **THEN** nothing is shared

#### Scenario: Stopping a share

- **GIVEN** the participant is sharing
- **WHEN** they stop sharing
- **THEN** sharing ends for everyone
- **AND** every participant's layout returns to the video grid

### Requirement: Screen sharing is hidden on devices that cannot capture the screen

The share button SHALL be hidden on any device whose browser cannot capture the screen, such as iOS Safari.

#### Scenario: Browser without screen capture

- **GIVEN** the participant uses a browser that cannot capture the screen
- **WHEN** the call controls are shown
- **THEN** the share button is not shown

### Requirement: The shared screen becomes the main area while anyone is sharing

While any participant is sharing, the shared screen SHALL be the main area and participant tiles SHALL move into a side column that scrolls.

#### Scenario: Layout switches for every participant

- **GIVEN** a participant starts sharing
- **WHEN** the layout updates
- **THEN** the shared screen is the main area for every other participant
- **AND** participant tiles sit in a scrolling column beside it

#### Scenario: Layout reverts when the share ends

- **GIVEN** the only share in the call ends
- **WHEN** the layout updates
- **THEN** every participant returns to the video grid

#### Scenario: Smaller tiles in the pop-out window

- **GIVEN** the call is popped out while a share is showing
- **WHEN** the pop-out window is shown
- **THEN** the side column's tiles are shorter than in the full call view

### Requirement: Several shares are shown as tabs

When more than one participant is sharing, each share SHALL appear as a tab and the active tab SHALL be the share in focus.

#### Scenario: Reader's own share is in focus

- **GIVEN** several participants are sharing and the reader is one of them
- **WHEN** the call view is shown
- **THEN** the reader's own share is the one in focus

#### Scenario: First sharer is in focus when the reader is not sharing

- **GIVEN** several participants are sharing and the reader is not one of them
- **WHEN** the call view is shown
- **THEN** the first sharer in the list is in focus

#### Scenario: Pinned tile takes the focus for the reader

- **GIVEN** the reader has pinned a participant's tile
- **WHEN** the presenter layout is shown
- **THEN** the pinned participant is in focus for the reader only

### Requirement: Clicking the shared screen makes the whole call full screen

Clicking the shared screen SHALL make the whole call view full screen rather than only the shared picture.

#### Scenario: Full-screen from the call view

- **GIVEN** the reader is in the call view and a share is showing
- **WHEN** the reader clicks the shared screen
- **THEN** the whole call view, including participant tiles and controls, fills the screen

#### Scenario: No full screen from the pop-out window

- **GIVEN** the call is popped out and a share is showing
- **WHEN** the reader clicks the shared screen
- **THEN** nothing changes

### Requirement: Starting a share moves the call into picture-in-picture

Starting a screen share SHALL move the call into picture-in-picture so the sharer keeps seeing the call.

#### Scenario: Share starts the pop-out

- **GIVEN** the reader is in a call
- **WHEN** the reader's screen share starts
- **THEN** the call is popped out

### Requirement: A moderator can stop any participant's share for everyone

A moderator with permission to mute members SHALL be able to stop any participant's screen share for everyone in the call.

#### Scenario: Moderator stops a share

- **GIVEN** a moderator is in a call where a participant is sharing
- **WHEN** the moderator stops that participant's share
- **THEN** the share ends for everyone in the call
- **AND** the sharer's client stops sharing and shows a notice

#### Scenario: Stop refused without permission

- **GIVEN** a member who cannot mute members is in a call where a participant is sharing
- **WHEN** they try to stop that share
- **THEN** the stop is refused and the share continues
