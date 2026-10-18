## Purpose

When the browser refuses to play a call's sound without a gesture, a notice with a Play sound button starts it — and a deafened reader stays deafened.

## Requirements

### Requirement: A refused call sound shows a notice with a Play sound button

The call SHALL show a notice with a Play sound button whenever the browser refuses to play the call's sound.

#### Scenario: Notice appears when playback is refused

- **GIVEN** the reader has joined a call
- **WHEN** the browser refuses to play the call's sound
- **THEN** a notice says the browser is keeping the call quiet until the reader allows its sound
- **AND** the notice has a Play sound button

#### Scenario: Pressing Play sound starts the call's sound

- **GIVEN** the notice is showing
- **WHEN** the reader presses Play sound
- **THEN** the call's sound plays
- **AND** the notice disappears

#### Scenario: No notice when the sound plays

- **GIVEN** the browser allows the call's sound to play
- **WHEN** the call's sound starts
- **THEN** no notice is shown

#### Scenario: Playback refused again after a press

- **GIVEN** the reader has pressed Play sound
- **WHEN** the browser refuses playback again
- **THEN** the notice is shown again with its Play sound button

### Requirement: A deafened reader stays deafened when blocked sound starts

A reader who is deafened SHALL remain deafened after the call's sound starts from a Play sound press.

#### Scenario: Deafened reader presses Play sound

- **GIVEN** the reader was deafened while the notice was showing
- **WHEN** the reader presses Play sound
- **THEN** the call's sound stays silent for the reader

#### Scenario: Deafened reader is refused again

- **GIVEN** the reader is deafened
- **WHEN** the browser refuses the call's sound again
- **THEN** the reader remains deafened

### Requirement: The notice appears on every surface that shows the call

The Play sound notice SHALL appear in the call view, in the picture-in-picture window and under a room's call strip while the call view is closed.

#### Scenario: Notice above the call view controls

- **GIVEN** the call's sound is blocked
- **WHEN** the reader is in the call view
- **THEN** the notice is shown above the call view's controls

#### Scenario: Notice in the picture-in-picture window

- **GIVEN** the call is popped out and its sound is blocked
- **WHEN** the reader views the pop-out window
- **THEN** the notice is shown above the window's controls
- **AND** pressing Play sound in the window starts the call's sound

#### Scenario: Notice under the room's call strip

- **GIVEN** the room's call strip is visible and the call view is closed
- **WHEN** the call's sound is blocked
- **THEN** the notice is shown under the call strip
