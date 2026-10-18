## Purpose

Document PiP pop-out of the active call — DOM relocation into an always-on-top OS window, no media reconnection.

## Requirements

### Requirement: Popping out moves the call into a window without reconnecting

Popping out a call SHALL show the call in an always-on-top window without interrupting its audio or video.

#### Scenario: Pressing the pop-out control

- **GIVEN** the reader is in a call
- **WHEN** the reader presses the pop-out control
- **THEN** the call appears in an always-on-top window
- **AND** audio and video continue without reconnecting

#### Scenario: The page shows a mini player while the call is popped out

- **GIVEN** the call is popped out
- **WHEN** the reader views the main page
- **THEN** the page shows a notice that the call is in a mini player
- **AND** the full control bar remains usable on the page

### Requirement: The pop-out window shows the call stage and a compact control row

The pop-out window SHALL show the full call stage together with a compact row of call controls.

#### Scenario: Stage in the pop-out window

- **GIVEN** the call is popped out
- **WHEN** the pop-out window is shown
- **THEN** it shows the same stage as the call view with tighter spacing
- **AND** a shared screen is not clickable to make the window full screen

#### Scenario: Compact control row

- **GIVEN** the call is popped out
- **WHEN** the pop-out window is shown
- **THEN** its control row offers mute, camera, screen share, deafen, raise hand, Return to Call and leave
- **AND** it does not offer the device menus or the connection health indicator

### Requirement: Returning to the call docks it back into the page

Returning to the call SHALL dock the call back into the page without ending it.

#### Scenario: Return to Call from the pop-out window

- **GIVEN** the call is popped out
- **WHEN** the reader presses Return to Call
- **THEN** the call is docked back into the page
- **AND** the call continues

#### Scenario: Closing the pop-out window

- **GIVEN** the call is popped out
- **WHEN** the reader closes the pop-out window
- **THEN** the call is docked back into the page

#### Scenario: Leaving the call while popped out

- **GIVEN** the call is popped out
- **WHEN** the reader leaves the call
- **THEN** the pop-out window closes
- **AND** the page shows no call

### Requirement: The pop-out control appears only where the browser supports it

The pop-out control SHALL appear only in browsers that support pop-out windows, and the full-page call view SHALL remain available everywhere.

#### Scenario: Browser without pop-out support

- **GIVEN** the browser does not support pop-out windows
- **WHEN** the reader is in a call
- **THEN** no pop-out control is shown
- **AND** the full-page call view works

#### Scenario: Window cannot be opened

- **GIVEN** the browser denies the pop-out window or cannot open it
- **WHEN** the reader presses the pop-out control
- **THEN** the call stays on the page

### Requirement: Starting a screen share pops the call out once a screen is chosen

Starting a screen share SHALL pop the call out only after the reader has chosen what to share.

#### Scenario: Choosing a screen pops the call out

- **GIVEN** the reader is in a call
- **WHEN** the reader starts a screen share and chooses a window to share
- **THEN** the call is popped out

#### Scenario: Cancelling the share picker

- **GIVEN** the reader is in a call
- **WHEN** the reader starts a screen share and cancels the picker
- **THEN** nothing is shared
- **AND** the call is not popped out

### Requirement: A popped-out standalone call stays connected when its page is left

A standalone call that is popped out SHALL stay connected when the reader navigates away from its page.

#### Scenario: Navigating away while popped out

- **GIVEN** a standalone call is popped out
- **WHEN** the reader navigates away from the call page
- **THEN** the call continues
- **AND** the left sidebar shows the active call with a link back to it

### Requirement: Screen share plays in the pop-out window without a prior interaction

Screen share video SHALL play in the pop-out window even though the window has had no interaction of its own.

#### Scenario: Shared picture appears in the pop-out window

- **GIVEN** a screen share starts while the call is popped out
- **WHEN** the shared picture loads in the pop-out window
- **THEN** the picture plays rather than staying blank
- **AND** the shared screen's audio is still heard
