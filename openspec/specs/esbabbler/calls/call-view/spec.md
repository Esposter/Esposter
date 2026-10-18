## Purpose

The call surface, prejoin/ready room, participant tiles, and control bar — shared between /calls/[id] and the room's call view, which opens in place over the room's content.

## Requirements

### Requirement: A room's call opens in place over the room's content

A room's call view SHALL open over the room's content so that the room's dock and room list stay visible beside it.

#### Scenario: Joining a room's call opens the call view

- **GIVEN** the reader is viewing a room
- **WHEN** the reader joins the room's call
- **THEN** the call view opens over the room's messages
- **AND** the dock and the room list remain on screen

#### Scenario: Closing the call view returns to the call strip

- **GIVEN** the call view is open
- **WHEN** the reader presses Close call view
- **THEN** a call strip shows over the room's messages
- **AND** the call keeps running

#### Scenario: Opening the call view from the strip

- **GIVEN** a call is running and the call strip is showing
- **WHEN** the reader presses Open call view
- **THEN** the call view opens over the room's content

#### Scenario: Leaving the call closes the call view

- **GIVEN** the call view is open
- **WHEN** the reader presses Leave Call
- **THEN** the reader leaves the call
- **AND** the call view closes

### Requirement: The call stage fills the view and lays participants out by count

The participant stage SHALL fill the call view without a framing card and SHALL arrange participants by how many are present.

#### Scenario: One participant fills the stage

- **GIVEN** one participant is in the call
- **WHEN** the call view is shown
- **THEN** that participant fills the stage as a single column

#### Scenario: Two participants share up to two columns

- **GIVEN** two participants are in the call
- **WHEN** the call view is shown
- **THEN** they share the stage in up to two columns

#### Scenario: Three or more participants share a responsive grid

- **GIVEN** three or more participants are in the call
- **WHEN** the call view is shown
- **THEN** they share the stage in a grid that adapts to the stage's width

#### Scenario: Controls wrap on a narrow screen

- **GIVEN** the screen is too narrow for the control bar on one line
- **WHEN** the call view is shown
- **THEN** the controls wrap onto a second line, centred

### Requirement: A presenter indicator shows while someone is presenting

The call view SHALL show a presenter indicator while any participant is presenting.

#### Scenario: Indicator names the presenter

- **GIVEN** a participant named Dana is presenting
- **WHEN** the call view is shown
- **THEN** an indicator reads Dana is presenting

#### Scenario: Presenter can stop presenting from the indicator

- **GIVEN** the reader is presenting
- **WHEN** the indicator is shown
- **THEN** it includes a Stop presenting action

#### Scenario: No indicator when nobody is presenting

- **GIVEN** no participant is presenting
- **WHEN** the call view is shown
- **THEN** no presenter indicator is shown

### Requirement: Each participant appears as a tile

Each participant SHALL appear as a tile that shows their camera when it is on and a large avatar when it is off.

#### Scenario: Camera on shows video

- **GIVEN** a participant's camera is on
- **WHEN** their tile is shown
- **THEN** the tile shows their camera video

#### Scenario: Camera off shows an avatar

- **GIVEN** a participant's camera is off
- **WHEN** their tile is shown
- **THEN** the tile shows a large avatar of that participant

#### Scenario: Speaking participant's tile glows

- **GIVEN** a participant is speaking
- **WHEN** their tile is shown
- **THEN** the tile shows a glow that eases in and out with their voice

#### Scenario: Tile label shows status marks

- **GIVEN** a participant is sharing their screen, has a raised hand and is muted
- **WHEN** their tile is shown
- **THEN** the tile label shows their name with a mark for each of those states
- **AND** the deafened mark is shown only on the reader's own tile

### Requirement: Clicking a tile pins that participant for the reader

A click on a participant's tile SHALL pin that participant to the stage for the reader who clicked.

#### Scenario: Pinning changes only the reader's view

- **GIVEN** the reader is in a call with a participant named Sam
- **WHEN** the reader clicks Sam's tile
- **THEN** Sam is pinned to the stage for the reader
- **AND** other participants' views are unchanged

### Requirement: Every call surface offers the same controls in one order

Every call surface SHALL offer the same controls in the same order: microphone, camera, deafen, screen share, raise hand and connection health, then picture-in-picture and leave.

#### Scenario: Controls appear in the fixed order

- **GIVEN** the reader is in a call
- **WHEN** the control bar is shown
- **THEN** the controls appear in the order microphone, camera, deafen, screen share, raise hand, connection health, picture-in-picture, leave

#### Scenario: Moderator lowers a participant's hand

- **GIVEN** a moderator is in a room's call
- **WHEN** they open the action menu of a participant whose hand is raised
- **THEN** the menu offers Lower Hand

### Requirement: Control states show their meaning through colour and a spinner

A call control SHALL show the danger treatment while it is off or stopping, the accent treatment while it is on, and a spinner in place of its icon while it is pending.

#### Scenario: Muted microphone shows the danger treatment

- **GIVEN** the reader is muted
- **WHEN** the control bar is shown
- **THEN** the microphone control shows the danger treatment

#### Scenario: Raised hand shows the accent treatment

- **GIVEN** the reader's hand is raised
- **WHEN** the control bar is shown
- **THEN** the raise hand control shows the accent treatment

#### Scenario: Pending control shows a spinner

- **GIVEN** a control's action is in progress
- **WHEN** the control is shown
- **THEN** a spinner is shown in place of its icon

### Requirement: Device controls open one list per device kind

A microphone or camera control SHALL open a popover that lists each device kind with the device in use selected.

#### Scenario: Device lists per kind

- **GIVEN** the browser lists microphones and speakers
- **WHEN** the reader opens the microphone control's popover
- **THEN** each device kind has its own list under its title
- **AND** the device in use is the selected item

#### Scenario: Kind with no devices shows the system default

- **GIVEN** the browser lists no devices of one kind
- **WHEN** the reader opens the popover
- **THEN** that kind shows the system default

#### Scenario: Camera popover offers virtual backgrounds

- **GIVEN** the reader opens the camera control's popover
- **WHEN** the popover is shown
- **THEN** a grid of virtual backgrounds appears beneath the camera list

### Requirement: Every visitor sees a ready room before joining

A standalone call page SHALL show a ready room before any visitor joins, including the call's creator.

#### Scenario: Creator is not joined on arrival

- **GIVEN** the call's creator opens the call page
- **WHEN** the page loads
- **THEN** the ready room shows a camera and microphone preview
- **AND** the creator is not yet in the call

#### Scenario: Creator joins from the ready room

- **GIVEN** the creator is in the ready room
- **WHEN** they press Join now
- **THEN** the call view opens with the full-stage grid

#### Scenario: Guest requests to join

- **GIVEN** a guest is in the ready room
- **WHEN** they request to join
- **THEN** the waiting room is shown

#### Scenario: Creator admits a waiting guest

- **GIVEN** a guest is in the waiting room
- **WHEN** the creator admits the guest
- **THEN** the guest joins the call once

#### Scenario: Creator declines a waiting guest

- **GIVEN** a guest is in the waiting room
- **WHEN** the creator declines the request
- **THEN** the guest returns to the ready room

#### Scenario: Off device shown without repeated text

- **GIVEN** the microphone is off in the ready room
- **WHEN** the ready room is shown
- **THEN** the toggle shows the off state through its icon and colour only

### Requirement: Leaving a standalone call page ends the reader's participation

Leaving a standalone call page SHALL end the reader's participation in the call unless the call has been popped out.

#### Scenario: Navigating away leaves the call

- **GIVEN** the reader is in a standalone call
- **WHEN** the reader navigates away from the call page
- **THEN** the reader leaves the call
- **AND** any pending request to join is cancelled

#### Scenario: A popped-out call stays connected

- **GIVEN** the standalone call is popped out
- **WHEN** the reader navigates away from the call page
- **THEN** the call continues

### Requirement: Moderation actions are offered only inside a room's call

Moderation actions for call participants SHALL be offered only in a room's call, not on the standalone call page.

#### Scenario: Moderator in a room's call sees moderation actions

- **GIVEN** a moderator is in a room's call
- **WHEN** they open a participant's action menu
- **THEN** the moderation actions are offered

#### Scenario: Standalone call offers no moderation actions

- **GIVEN** a participant is on the standalone call page
- **WHEN** they open a participant's action menu
- **THEN** no moderation actions are offered

### Requirement: Moving away from a room's messages keeps its call running

Moving away from a room's messages SHALL NOT end the reader's call in that room.

#### Scenario: Opening another room during a call

- **GIVEN** the reader is in a room's call
- **WHEN** the reader opens a different room
- **THEN** the reader stays in the call
