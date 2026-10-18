## Purpose

Hold-to-talk keybind driving the mic gate, with a configurable release delay. A member transmits only while a chosen key is held, and the microphone closes shortly after release so the end of a word is not cut off.

## Requirements

### Requirement: The microphone transmits only while the push-to-talk key is held

In push-to-talk mode the microphone SHALL transmit only while the bound key is held.

#### Scenario: a member holds the key and speaks

- **GIVEN** a member in a call in push-to-talk mode with a key bound
- **WHEN** the member holds the key
- **THEN** the member's microphone transmits

#### Scenario: a member releases the key

- **GIVEN** a member holding the bound key
- **WHEN** the member releases the key and the release delay passes
- **THEN** the microphone goes silent

#### Scenario: no key is bound

- **GIVEN** a member in push-to-talk mode with no key bound
- **WHEN** the member presses any key
- **THEN** the microphone does not transmit

### Requirement: The release delay is between 0 and 2000 milliseconds

The release delay SHALL be a whole number of milliseconds from 0 to 2000, and it defaults to 20.

#### Scenario: a member sets the release delay to zero

- **GIVEN** a member setting the release delay
- **WHEN** the member sets it to 0 milliseconds
- **THEN** the microphone closes immediately on release

#### Scenario: a release delay outside the range is refused

- **GIVEN** a member setting the release delay
- **WHEN** the member saves a value above 2000 milliseconds
- **THEN** the value is refused and the previous delay stays in effect

### Requirement: Pressing the key again during the release delay keeps the microphone open

A key pressed again before the release delay ends SHALL cancel the pending close.

#### Scenario: a member presses the key again quickly

- **GIVEN** a member who has just released the bound key
- **WHEN** the member presses it again before the release delay ends
- **THEN** the microphone stays open

### Requirement: Losing focus releases the key

When the app window loses focus, a held push-to-talk key SHALL count as released.

#### Scenario: the window loses focus while the key is held

- **GIVEN** a member holding the bound key
- **WHEN** the app window loses focus
- **THEN** the microphone closes after the release delay

### Requirement: Typing does not transmit

A press of the bound key while the member is typing in a text field SHALL NOT open the microphone.

#### Scenario: a member types the bound key in the composer

- **GIVEN** a member in push-to-talk mode with a key bound
- **WHEN** the member types that key into the message composer
- **THEN** the microphone does not transmit

### Requirement: Changing mode or key closes the microphone immediately

Leaving push-to-talk mode, or rebinding the key while it is held, SHALL close the microphone at once.

#### Scenario: a member switches back to voice activity mode

- **GIVEN** a member holding the push-to-talk key
- **WHEN** the member switches the input mode to voice activity
- **THEN** the microphone closes immediately

#### Scenario: a member rebinds the key while holding it

- **GIVEN** a member holding the bound key
- **WHEN** the member changes the bound key
- **THEN** the microphone closes immediately

### Requirement: Push-to-talk works in the picture-in-picture window

Push-to-talk SHALL work in the call's picture-in-picture window as well as the main window.

#### Scenario: a member holds the key while the call is in picture-in-picture

- **GIVEN** a call shown in a picture-in-picture window with the window focused
- **WHEN** the member holds the bound key
- **THEN** the microphone transmits
