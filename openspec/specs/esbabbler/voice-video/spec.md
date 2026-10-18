## Purpose

The Voice & Video panel and how each preference applies to live calls. Covers the devices a member picks, how volume and input settings change what others hear, the input profiles, and the sensitivity range that decides when the microphone is silent.

## Requirements

### Requirement: A device chosen in settings is the one every picker and call uses

A microphone, speaker or camera chosen in the Voice & Video panel SHALL be used for the mic test, the pre-join preview and any call the member joins.

#### Scenario: a member changes the microphone before joining a call

- **GIVEN** a member who picks a different microphone in the panel
- **WHEN** the member opens the pre-join preview
- **THEN** the preview uses the newly chosen microphone

#### Scenario: a member switches microphone during a call

- **GIVEN** a member in a call
- **WHEN** the member picks a different microphone in the call's device picker
- **THEN** the call switches to the new microphone without rejoining

### Requirement: Voice and video preferences apply on join and change live during a call

Voice and video preferences SHALL apply when the member joins a call and SHALL update in an ongoing call when changed.

#### Scenario: a member chooses to join muted

- **GIVEN** a member who has set mute on join
- **WHEN** the member joins a call
- **THEN** the member's microphone starts muted

#### Scenario: a member changes speaker volume during a call

- **GIVEN** a member in a call with other participants
- **WHEN** the member lowers the speaker volume
- **THEN** every other participant sounds quieter to the member

### Requirement: Microphone volume can boost the member's own microphone above normal

Microphone volume SHALL scale the member's own microphone level, and SHALL allow a boost above one hundred percent.

#### Scenario: a member boosts the microphone

- **GIVEN** a member setting microphone volume above one hundred percent
- **WHEN** the member speaks in a call
- **THEN** the others hear the member louder than at one hundred percent

### Requirement: Speaker volume scales remote participants but does not boost them

Speaker volume SHALL scale the audio of every remote participant and SHALL NOT raise any participant above their normal level.

#### Scenario: speaker volume at its highest setting

- **GIVEN** a member with speaker volume at one hundred percent
- **WHEN** a remote participant speaks
- **THEN** the participant is heard at their normal level

### Requirement: In voice activity mode the microphone is silent below the sensitivity threshold

In voice activity mode the microphone SHALL be silent whenever the input level is below the member's sensitivity threshold.

#### Scenario: a member speaks quietly below the threshold

- **GIVEN** a member in voice activity mode with a sensitivity threshold set
- **WHEN** the member's input is quieter than the threshold
- **THEN** the microphone is silent to the others

#### Scenario: a sensitivity value outside the range is refused

- **GIVEN** a member setting the sensitivity threshold
- **WHEN** the member saves a value above zero decibels or below minus one hundred decibels
- **THEN** the value is refused and the previous threshold stays

### Requirement: The input profile chooses how the microphone signal is processed

The input profile SHALL choose between voice isolation, studio and custom processing of the microphone signal.

#### Scenario: a member chooses studio

- **GIVEN** a member choosing the studio input profile
- **WHEN** the member joins a call
- **THEN** the microphone signal is sent without the browser's noise suppression, echo cancellation or automatic gain

#### Scenario: a member chooses voice isolation

- **GIVEN** a member choosing the voice isolation input profile
- **WHEN** the member joins a call
- **THEN** the browser's noise suppression, echo cancellation and automatic gain are on

### Requirement: The panel warns when microphone access has not been granted

When no microphone permission is granted, the Voice & Video panel SHALL show a warning with a way to grant it.

#### Scenario: a member has not granted microphone access

- **GIVEN** a member whose browser has not granted microphone access
- **WHEN** the member opens the Voice & Video panel
- **THEN** a warning is shown
- **AND** the warning links to the browser's permission settings

### Requirement: The mic test shows the live microphone level

The Voice & Video panel SHALL show a live level meter for the selected microphone.

#### Scenario: a member tests the microphone

- **GIVEN** a member with microphone access
- **WHEN** the member speaks into the selected microphone
- **THEN** the level meter moves with the input
