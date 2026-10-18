# Music synthesizer

The synthesizer is `genshin-engine`'s audio module. It plays each note of a [voice](../voices/design.md) from that voice's fitted instrument, so the synthesizer is the music's base: a voice's recording, when one is layered, plays beside its synthesized note rather than in place of it ([sampled instruments](../../sampled-instruments/design.md)).

## Notes and noise

- **Each note is an oscillator over the instrument's harmonics.** A note's partials are sounded at the instrument's measured overtone amplitudes, through one gain following the instrument's attack, decay and release envelope.
- **The noise is a looped buffer built in the spectrum.** `computeNoiseSamples` builds the buffer over the engine's `transformFourier`, with every band in the one transform: each band is flat between its half octaves at the level the instrument gives it. So no band leaks into another, and the loop has no seam.
- **The envelope's end is worked out, not held.** The envelope's value at the note's end is computed and scheduled, rather than held with `cancelAndHoldAtTime`, which Firefox lacks.
- **Every note reads the noise from the loop's clock.** Each note's noise starts at the loop clock's current position, with one phase per band across every buffer, which overfills the lowest band: a known defect, explained with the remedies that did not ship under [music](../README.md#not-yet).

## The player

- **`createMusicPlayer` schedules ahead of the clock.** It schedules the notes due in the next two seconds every half second, and loops the playlist.
- **`renderMusicSegment` renders one segment offline** through the same notes, so the parity page scores what the player plays.
- **Each segment has its own expression gain.** The segment plays its notes through a gain of its own, which the [expression](../expression/design.md) ramps between the windows' centres (`scheduleMusicExpression`). A chord ringing past its segment's end fades from the level it ended at rather than jumping to the next segment's.

## Key files

| File                                                           | Role                                                             |
| :------------------------------------------------------------- | :--------------------------------------------------------------- |
| `packages/genshin-engine/src/audio/computeNoiseSamples.ts`     | An instrument's noise, its bands built in one spectrum           |
| `packages/genshin-engine/src/audio/scheduleMusicNote.ts`       | One note's oscillator and envelope                               |
| `packages/genshin-engine/src/audio/createMusicPlayer.ts`       | The live player                                                  |
| `packages/genshin-engine/src/audio/scheduleMusicExpression.ts` | A segment's expression ramped on the gain its notes play through |
| `packages/genshin-world/src/components/Login/Music/Index.vue`  | Where the login's music plays                                    |

## Sources

The additive model the synthesizer follows, one envelope per harmonic, is cited on the [voices](../voices/design.md) page.
