## Purpose

The login's music layers public-domain recordings of real instruments over the engine's synthesizer. Each voice keeps its synthesized note, and a recording from an openly licensed library plays on top of it at a level solved against the game's sound, so a level of zero is the synthesizer exactly. A layering ships only where it brings a piece nearer the game's octave bands while keeping the synthesizer's pitch agreement.

## Requirements

### Requirement: Each voice keeps its synthesized note under any recording

Each voice of the login's music SHALL keep its synthesized note playing, with a recording of a real instrument layered over it only at the level its solve set.

#### Scenario: A voice with a zero level plays the synthesizer alone

- **GIVEN** a voice's recording level is zero
- **WHEN** the voice's note sounds
- **THEN** only the synthesized note plays

#### Scenario: A voice with a recording plays both layers

- **GIVEN** a voice has a recording at a level above zero
- **WHEN** the voice's note sounds
- **THEN** the synthesized note plays
- **AND** the recording plays beside it at its level

### Requirement: Only openly licensed sample libraries are used

Only recordings from sample libraries dedicated to the public domain SHALL be used, and a library under any other licence SHALL be left out.

#### Scenario: A library under a non-public-domain licence is left out

- **GIVEN** a sample library is offered under an attribution licence
- **WHEN** the libraries are catalogued
- **THEN** that library is left out of the catalogue

#### Scenario: Public-domain libraries are catalogued

- **GIVEN** a sample library is dedicated to the public domain
- **WHEN** the libraries are catalogued
- **THEN** its instruments are available to the solve

### Requirement: A layering ships only where it moves the mix nearer the game

A segment SHALL ship with recordings only where its mix sits nearer the game's octave bands than the synthesizer alone while keeping the synthesizer's pitch agreement.

#### Scenario: A mix that loses pitch agreement is not shipped

- **GIVEN** every tried level of a segment's mix loses the synthesizer's pitch agreement
- **WHEN** the solve chooses what ships
- **THEN** the segment plays the synthesizer alone

#### Scenario: A mix nearer the game's bands ships with its recordings

- **GIVEN** a segment's best mix sits nearer the game's bands than the synthesizer
- **WHEN** the solve chooses what ships
- **THEN** each voice of the segment plays its chosen recording at its chosen level

### Requirement: A recording plays at its voice's tuning

Each recording SHALL be shifted to the tuning of the voice it plays, not left at the tuning of its own sample.

#### Scenario: A voice tuned off its sample's centre is shifted to its tuning

- **GIVEN** a voice is tuned half a semitone away from its sample's centre
- **WHEN** the voice's recording plays a note
- **THEN** the recording is shifted to the voice's tuning

### Requirement: The instrument and level are chosen by the solve's measured mix

Each voice's instrument and level SHALL be chosen by the measured mix and its listening score, never by how close an instrument's harmonic profile sits to the game's.

#### Scenario: A profile-close instrument is not chosen on profile alone

- **GIVEN** an instrument's harmonic profile sits close to the game's voice
- **WHEN** candidate instruments are ranked
- **THEN** the mix's listening score decides the choice rather than the profile distance

### Requirement: The music starts without recordings when they cannot be fetched

The login's music SHALL start its playlist once its recordings are decoded, and SHALL start it on the synthesizer alone when they cannot be fetched.

#### Scenario: The playlist waits for decoded recordings

- **GIVEN** the login's music has mounted
- **WHEN** its recordings are being fetched
- **THEN** the playlist starts once they are decoded

#### Scenario: A failed fetch starts the playlist on the synthesizer

- **GIVEN** the login's music has mounted
- **WHEN** the recordings cannot be fetched
- **THEN** the playlist starts with the synthesizer alone

### Requirement: No reverb is added unless the notes die sooner than the game's

A segment SHALL NOT have reverb added unless its rendered notes end sooner than the game's notes do.

#### Scenario: A segment whose notes hold their level gets no reverb

- **GIVEN** a segment's largest gaps hold their level from a note's start
- **WHEN** the segment is rendered
- **THEN** no reverb is added to it
