## Purpose

The engine's synthesizer that plays a music record. Each note is an oscillator over its instrument's harmonics and its noise from a looped buffer, through one gain following its envelope, and a player schedules the notes ahead of the audio clock.

## Requirements

### Requirement: Note as harmonics under an envelope

Each note SHALL sound as an oscillator over its instrument's harmonics at the instrument's measured overtone amplitudes, through one gain following its attack, decay and release envelope.

#### Scenario: Note plays

- **WHEN** a note plays
- **THEN** its partials sound at the instrument's overtone amplitudes
- **AND** its gain follows the attack, decay and release envelope

### Requirement: Noise as a seamless loop

The instrument's noise SHALL be a looped buffer built in the spectrum, each band flat at its level, so that no band leaks into another and the loop has no seam.

#### Scenario: Noise loops

- **WHEN** the noise plays
- **THEN** the loop has no audible seam and each band holds its own level

### Requirement: Envelope end is scheduled, not held

A note's envelope SHALL be scheduled to its computed value at the note's end rather than held, so that it ends correctly in browsers that lack holding.

#### Scenario: Note ends in a browser without holding

- **WHEN** a note ends in a browser that lacks holding the envelope
- **THEN** the envelope ends at its computed level

### Requirement: Noise starts from the loop clock

Each note's noise SHALL start from the loop clock's position, with one phase per band across every buffer.

#### Scenario: Notes sounding at once share one noise

- **WHEN** two notes sound at the same time
- **THEN** they play one noise in step, as the clock's position gives every note the same phase

### Requirement: Player schedules ahead of the clock

The player SHALL schedule the notes due in the next two seconds every half second and SHALL loop the playlist.

#### Scenario: Playlist plays

- **WHEN** the player is running
- **THEN** notes due in the next two seconds are scheduled every half second
- **AND** the playlist loops

### Requirement: Segment rendered offline

A segment SHALL render offline through the same notes the player uses, so the parity score judges what the player plays.

#### Scenario: Segment rendered for scoring

- **WHEN** a segment is rendered offline
- **THEN** it uses the same notes as the live player

### Requirement: Chord fades from its last level

A chord ringing past its segment's end SHALL fade from the level it ended at rather than jump to the next segment's level.

#### Scenario: Chord crosses a segment boundary

- **WHEN** a chord rings past its segment's end
- **THEN** it fades from the level it ended at

## Open

- [ ] **The noise loop has no audible seam and each band holds its own level** — no source yet: no seam or level measurement is recorded.
- [ ] **The player loops the playlist** — no source yet: the loop is not located in `createMusicPlayer.ts`; the playlist's `isLooping` flag is the only checked source.
- [ ] **A player schedules the notes ahead of the audio clock** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **Each note sounds as an oscillator over its instrument's harmonics at the measured overtone amplitudes, through one gain following its envelope** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **A note's envelope is scheduled to its computed value at the note's end, so it ends in browsers that lack holding** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **Each note's noise starts from the loop clock's position, with one phase per band across every buffer** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **The player schedules the notes due in the next two seconds every half second** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **A segment renders offline through the same notes the player uses, so the parity score judges what the player plays** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **A chord ringing past its segment's end fades from the level it ended at, rather than jumping to the next segment's level** — no source yet: game data or a snapshot that holds this behaviour
