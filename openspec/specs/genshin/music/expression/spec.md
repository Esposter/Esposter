## Purpose

The swell each segment of the login's music carries, one gain per window over every voice, fitted to the game's own sound and played as a ramp between the windows' centres `scripts/src/services/genshinParity/music/fitMusicExpression.ts`, `packages/genshin-engine/src/audio/scheduleMusicExpression.ts`, the way an orchestral expression controller swells a whole section.

## Requirements

### Requirement: Whole-section swell

Each segment of the login music SHALL swell or fade as a whole, with one gain per window over all its voices, so that a section plays louder or softer than the one before it.

#### Scenario: Section louder than the last

- **WHEN** the music moves into a section louder than the one before
- **THEN** the whole segment swells by about twenty decibels across its voices

#### Scenario: Section softer than the last

- **WHEN** the music moves into a section softer than the one before
- **THEN** the whole segment fades by about twenty decibels across its voices

### Requirement: Gain on the output, not velocity

The swell SHALL be a gain on a segment's whole output, so that a chord already ringing fades with its section.

#### Scenario: Chord ringing as its section fades

- **GIVEN** a chord is ringing
- **WHEN** its section fades
- **THEN** the chord fades with the section

### Requirement: Gain ramps between window centres

Each segment's gain SHALL ramp between the windows' centres, evenly in decibels.

#### Scenario: Between two windows

- **WHEN** playback moves between two windows' centres
- **THEN** the gain ramps evenly in decibels between them

### Requirement: Fitted after the instruments

The gains SHALL be fitted after the instruments against the game's sound, and a second fit SHALL move them little.

#### Scenario: Fit run again

- **WHEN** the expression is fitted a second time
- **THEN** the gains change little

## Open

- [ ] **The whole segment swells or fades by about twenty decibels across its voices** — no source yet: no level measurement of a swell is recorded.
- [ ] **The gains change little when the expression is fitted a second time** — no source yet: no second run's output is recorded.
- [ ] **The gains are fitted after the instruments against the game's sound** — no source yet: the game's sound in `{data-root}/genshin-parity/extracted/music/` has no file named for expression, so its levels are not yet read against the gains.
