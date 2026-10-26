# Music expression

The game's orchestra plays a section louder and the next softer, by about twenty decibels at once in every band across the first piece. The transcription's velocities carry none of it: they read each note's amplitude much alike from section to section. So each segment carries an expression, one gain a window over every voice `scripts/src/services/genshinParity/music/fitMusicExpression.ts`, which swells and fades a whole section the way an orchestral mockup's expression controller (MIDI CC11) does.

## Why a gain, not velocity

A note's velocity is fixed when it starts, and a swell moves under notes already sounding. A ringing chord that the game lets fade with its section cannot have its level changed by velocity alone, so the swell is a gain on the segment's whole output ([MIDI CC11 vs CC1](#sources)).

## How it is fitted

- **The fit is after the instruments, against our render of them.** `genshin:parity expression` renders each segment as it ships, then fits each window's one gain over every band to the game's (`fitMusicExpression`) `scripts/src/services/genshinParity/commands/expressionCommand.ts`. The gains are solved exactly in the score's own measure `scripts/src/services/genshinParity/music/fitMusicExpression.ts`. A second run moves them little.
- **It is the largest gain of any step on the score.** It takes more distance off than any single voice or instrument step does, with pitch agreement unchanged.
- **The gains are the music's loudness, not any band's balance.** Gains fitted to half the bands and scored on the others leave nearly the same distance, so the swell is a loudness shape over time, not a fixed equaliser.

## How it plays

The player plays each segment's notes through a gain of their own `packages/genshin-engine/src/audio/createMusicPlayer.ts`. That gain ramps between the windows' centres, evenly in decibels (`scheduleMusicExpression`) `packages/genshin-engine/src/audio/scheduleMusicExpression.ts`. The gain's place in the player is on the [synthesizer](../synthesizer/design.md) page.

## Key files

| File                                                               | Role                                                             |
| :----------------------------------------------------------------- | :--------------------------------------------------------------- |
| `scripts/src/services/genshinParity/music/fitMusicExpression.ts`   | Each window's one gain over every band, fitted to the game's     |
| `scripts/src/services/genshinParity/commands/expressionCommand.ts` | Each segment's expression refitted against our render, published |

## Sources

- [MIDI CC11 vs CC1: expression and dynamics explained](https://modwheel.net/guides/understanding-midi-ccs), modwheel.net: expression as a section's volume over the layer already playing, and why velocity, fixed when a note starts, cannot swell a held note.

## Open

- [ ] **The game's orchestra swells or fades a section by about twenty decibels at once in every band across the first piece** — no source yet: no checked level measurement of the game's sections is recorded.
- [ ] **The transcription's velocities read each note's amplitude much alike from section to section** — no source yet: no velocity readout is on disk.
- [ ] **A second expression run moves the gains little** — no source yet: no second run's output is recorded.
- [ ] **The expression is the largest gain of any step on the score, with pitch agreement unchanged** — no source yet: the score snapshot holds only final scores, not each step's gain.
- [ ] **Gains fitted to half the bands and scored on the others leave nearly the same distance** — no source yet: no half-band fit run is recorded.
- [ ] **Each segment carries one gain a window over every voice, which swells and fades a section** — no source yet: a decoded reading of the game's expression curves for the gains, since `~/Esposter/genshin-parity/extracted/music/` holds only its chroma and decoding bins.
- [ ] **The fit renders each segment as it ships and fits each window's gain to the game's** — no source yet: a decoded reading of the game's expression curves to fit the gains against, since `~/Esposter/genshin-parity/extracted/music/` holds only its chroma and decoding bins.
