## Purpose

How a render of the login's music is judged against the game's own decoded sound, by pitch agreement and each octave band's level gap, with the other measures the parity commands read, and what their numbers are worth. The approval is by ear, since the score cannot hear.

## Requirements

### Requirement: Pitch agreement

Pitch agreement SHALL be the mean agreement of the two renders' pitch classes over the game's audible frames, and SHALL equal 1 when every frame names the same notes in the same balance.

#### Scenario: Same notes in every frame

- **WHEN** a render names the same notes in the same balance as the game in every frame
- **THEN** its pitch agreement is 1

### Requirement: Distance by octave band

The distance SHALL be each octave band's mean level gap in decibels from 63 Hz to 8 kHz, charging timbre and loudness alike.

#### Scenario: Band gaps averaged

- **WHEN** a render is scored
- **THEN** each octave band's level gap in decibels is averaged into the distance

### Requirement: Signed bias per band

The bias SHALL report each band's gap signed, negative where the render is the quieter, so that a band left short is told from one overfilled.

#### Scenario: Band left short

- **WHEN** a band in the render is quieter than the game's
- **THEN** its bias is negative

### Requirement: Render is what ships

The render SHALL be each segment as its own screen plays it, rendered offline on the parity page, so the score judges what ships.

#### Scenario: Segment rendered for scoring

- **WHEN** a segment is scored
- **THEN** it is rendered by the same notes the player plays

### Requirement: Numbers read against their ends

A score SHALL be read between the game against itself shifted later and against sound it does not hold, and pitch agreement SHALL never be quoted as how alike the music is.

#### Scenario: Distance read against its ends

- **WHEN** a score is reported
- **THEN** its distance is read between the game a quarter second off itself and the game two seconds off itself

### Requirement: Losing pitch agreement is a regression

A mix that loses pitch agreement SHALL count as a regression, whatever it gains in the bands.

#### Scenario: Pitch lost for band gain

- **WHEN** a step lowers pitch agreement while lowering the band distance
- **THEN** the step is a regression

### Requirement: No equaliser ships

No fixed gain per octave band SHALL ship, since a band gain fitted to half a segment's frames and scored on the other half leaves about as much distance as none.

#### Scenario: Equaliser fitted to half the frames

- **WHEN** a band gain is fitted to half a segment's frames and scored on the other half
- **THEN** it leaves about as much distance as no gain, so none ships

### Requirement: Approval by ear

A step SHALL be approved by ear once its numbers improve, since the score cannot hear how a mix sounds.

#### Scenario: Numbers improve

- **WHEN** a step improves its numbers
- **THEN** the user's ear decides whether it sounds right

### Requirement: Attack shares count jumps between frames

The attacks measure SHALL count how often each octave band's level jumps by the attack threshold from one frame to the next, in both the render and the game's sound.

#### Scenario: Scattered single notes

- **WHEN** the attacks are measured
- **THEN** each band's jump share is reported for the render and the game's sound
