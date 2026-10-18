## Purpose

How a source's notes are transcribed from the game's decoded sound, pruned to the notes that sound holds, split into three voices by register, and how each voice's instrument and noise are measured from that sound.

## Requirements

### Requirement: Notes transcribed from the game's sound

Each decoded source SHALL be transcribed into notes on whole pitches, with bends not carried and each voice offset by its measured tuning.

#### Scenario: Voice tuning applied

- **WHEN** a source is transcribed
- **THEN** each voice's notes sit on whole pitches offset by that voice's measured tuning

### Requirement: Only notes the game's sound holds

A transcribed note SHALL be kept only where the game's sound holds it, and a note on an overtone of a lower note SHALL be kept wherever the game's sound stands over the render with it silenced.

#### Scenario: Note the game does not hold

- **WHEN** a note is silenced and the game's sound does not stand over the render
- **THEN** the note is dropped

#### Scenario: Overtone note the game holds

- **WHEN** a note sits on an overtone of a lower note and the game's sound stands over the render with it silenced
- **THEN** the note is kept

### Requirement: Three voices by register

Each source's notes SHALL split into three registers at natural breaks over their pitches, each register forming one voice, with no hand-set pitches needed for a new piece.

#### Scenario: New piece added

- **WHEN** a new piece is added
- **THEN** its notes split into three voices by register without hand-set pitches

### Requirement: Instrument measured from clear notes

A voice's instrument SHALL be measured from the notes where its partials are clear of other notes, and each value SHALL be the median over those notes.

#### Scenario: Few or misread notes

- **WHEN** a few of a voice's notes are misread or covered by another instrument
- **THEN** the median is unaffected

#### Scenario: Note under the loudest voice's noise

- **WHEN** a note's peak sits under the noise of the voice's loudest
- **THEN** the note is not measured

#### Scenario: Overtone with too few clear readings

- **WHEN** an overtone has too few clear readings
- **THEN** it is left silent rather than guessed

### Requirement: Decay fitted as a curve of medians

The decay SHALL be fitted to a curve of medians rather than note by note, so that a voice rings on as its notes do in the game's sound.

#### Scenario: Voice decays

- **WHEN** a voice's decay is fitted
- **THEN** it rings on as long as the game's notes do rather than dying quickly

### Requirement: Noise only in noise-like bands

Only bands whose median flatness reads noise-like SHALL receive noise, and a tonal band SHALL receive none.

#### Scenario: Tonal band

- **WHEN** a band reads tonal
- **THEN** it receives no noise

#### Scenario: Noise-like band

- **WHEN** a band reads noise-like
- **THEN** it receives noise measured from its bins

### Requirement: Noise solved for all voices at once

Noise SHALL be solved for every voice together, band by band, so that the voices are told apart by how their mix moves from frame to frame.

#### Scenario: Noise solve

- **WHEN** the noise is solved
- **THEN** every voice is solved together in each band
