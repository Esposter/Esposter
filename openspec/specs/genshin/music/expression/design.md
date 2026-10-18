# Music expression

The game's orchestra plays a section louder and the next softer, by about twenty decibels at once in every band across the first piece. The transcription's velocities carry none of it: they read each note's amplitude much alike from section to section. So each segment carries an expression, one gain a window over every voice, which swells and fades a whole section the way an orchestral mockup's expression controller (MIDI CC11) does.

## Why a gain, not velocity

A note's velocity is fixed when it starts, and a swell moves under notes already sounding. A ringing chord that the game lets fade with its section cannot have its level changed by velocity alone, so the swell is a gain on the segment's whole output ([MIDI CC11 vs CC1](#sources)).

## How it is fitted

- **The fit is after the instruments, against our render of them.** `genshin:parity expression` renders each segment as it ships, then fits each window's one gain over every band to the game's (`fitMusicExpression`). The gains are solved exactly in the score's own measure. A second run moves them little.
- **It is the largest gain of any step on the score.** It takes more distance off than any single voice or instrument step does, with pitch agreement unchanged.
- **The gains are the music's loudness, not any band's balance.** Gains fitted to half the bands and scored on the others leave nearly the same distance, so the swell is a loudness shape over time, not a fixed equaliser.

## How it plays

The player plays each segment's notes through a gain of their own. That gain ramps between the windows' centres, evenly in decibels (`scheduleMusicExpression`). The gain's place in the player is on the [synthesizer](../synthesizer/design.md) page.

## Key files

| File                                                               | Role                                                             |
| :----------------------------------------------------------------- | :--------------------------------------------------------------- |
| `scripts/src/services/genshinParity/music/fitMusicExpression.ts`   | Each window's one gain over every band, fitted to the game's     |
| `scripts/src/services/genshinParity/commands/expressionCommand.ts` | Each segment's expression refitted against our render, published |

## Sources

- [MIDI CC11 vs CC1: expression and dynamics explained](https://modwheel.net/guides/understanding-midi-ccs), modwheel.net: expression as a section's volume over the layer already playing, and why velocity, fixed when a note starts, cannot swell a held note.
