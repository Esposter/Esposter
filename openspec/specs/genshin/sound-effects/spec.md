## Purpose

The game's sounds beside its music, the login's door first. Each is found among the game's own sounds by matching them against a recording that plays it, measured in both channels as three noises in each third of an octave over time, one the channels share and one each holds alone, and played by the engine's own noise from those levels alone, a measured delay after what sets it off. Scored against the game's own sounds, ours sits as near them as a second render of our own noise sits to the first.

## Requirements

### Requirement: Only measured levels and our own noise ship, never the game's sound

The game's own sounds SHALL NOT ship, and the login's sounds SHALL be played from their measured levels by the product's own noise.

#### Scenario: A deployed product holds no game sound

- **GIVEN** the product is built and deployed
- **WHEN** its contents are inspected
- **THEN** it holds the measured levels of each sound and no recording of the game's sound

#### Scenario: The door plays from the product's own noise

- **GIVEN** the login's door sound is played
- **WHEN** it sounds
- **THEN** it is the product's own noise shaped by the measured levels

### Requirement: The door sound starts a fixed delay after the click

The login's door sound SHALL start a fixed delay after the click that opens the door, and SHALL NOT wait on the sound being ready.

#### Scenario: The door sound follows the click after its delay

- **GIVEN** the login's music has started
- **WHEN** the player clicks to open the door
- **THEN** the door sound starts after its fixed delay
- **AND** the rush of sound follows the click shortly after

### Requirement: The door plays at the game's mix and is limited so it does not clip

The door sound SHALL play with its rumble louder than its rush, as the game mixes them, and SHALL be limited so that its peaks do not clip.

#### Scenario: The rumble plays louder than the rush

- **GIVEN** the door sound plays
- **WHEN** its two parts are heard
- **THEN** the rumble is louder than the rush

#### Scenario: Loud peaks are limited

- **GIVEN** the door sound reaches its loudest peak
- **WHEN** it is played through the output
- **THEN** the peak is limited so that it does not clip

### Requirement: The door keeps its two stereo channels apart as the game does

The door sound SHALL keep its two stereo channels distinct, with the two channels as alike as the game's own channels are.

#### Scenario: The channels are as alike as the game's

- **GIVEN** the door sound is played in stereo
- **WHEN** its two channels are compared
- **THEN** they are as alike as the game's two channels are

### Requirement: The door sound is accepted only within the grain of the noise

The door sound SHALL be accepted by the audio pass only when its difference from the game's sound stays within the grain of a second take of the same levels.

#### Scenario: A door sound within grain is accepted

- **GIVEN** the door sound differs from the game's sound by no more than a second take differs from the first
- **WHEN** the audio pass compares them
- **THEN** the door sound is accepted

#### Scenario: A door sound beyond grain is rejected

- **GIVEN** the door sound differs from the game's sound by more than a second take differs from the first
- **WHEN** the audio pass compares them
- **THEN** the door sound is rejected

### Requirement: The login's other sounds stay silent until they are matched

The login's button clicks and its wind SHALL NOT play until a recording that plays them clearly enough has been matched.

#### Scenario: A button click is silent before it is matched

- **GIVEN** the login's button clicks have not been matched
- **WHEN** the player presses a login button
- **THEN** no click sound plays
