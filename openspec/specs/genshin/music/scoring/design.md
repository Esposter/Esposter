# Music listening score

Every render of the login's music is scored against the game's decoded segment. The score is the measure every music step is fitted and approved against, and it is run by the `listen` command of `genshin:parity`. The latest numbers are the committed snapshot `scripts/src/services/genshinParity/shared/ParityMusicScores.snapshot.md`, which `listen` rewrites, so this page holds the measures and their reading, not the readings.

## The measures

- **Pitch agreement** is the mean dot product of the two's pitch classes over the game's audible frames. It is 1 when every frame names the same notes in the same balance.
- **The distance** is each octave band's mean level gap in decibels, from 63 Hz to 8 kHz. It charges timbre and loudness alike.
- **The bias** is each band's gap signed, under 0 where ours is the quieter. It tells a band ours leaves short from one it overfills.
- **The render** is the segment as its own screen plays it, offline on the parity page (`renderMusicSegments`), so the score judges what ships.

## What a score is worth

Each score is read between two ends: the game's segment against itself shifted later, and against sound it does not hold.

- Pitch agreement falls to about a quarter once the game is two seconds or more off itself, and under a fifth for one piece against the other. A render that holds above four in five names nearly the right notes at nearly the right time, closer than the game a quarter second off itself.
- The distance reads the other way. The game a quarter second off itself is a few decibels from itself, two seconds off well over twice that, and the other piece about twice the distance of the nearer end. A render that sits between the game a quarter second and two seconds off itself has the right notes, swelling where the game's do, in the wrong sound.
- So pitch agreement is never quoted as how alike the music is. The distance, read against these ends, is.

## Rules the score holds

- **Approval is by ear, since the score is blind to how a mix sounds.** The numbers show what a step changed, and the user's ears decide whether it sounds right. A step is approved by ear once its numbers improve.
- **A mix that loses pitch agreement is a regression**, whatever it gains in the bands. The recordings' solve holds this rule (see [sampled instruments](../../sampled-instruments/design.md)).
- **No equaliser ships.** A fixed gain per octave band, fitted to one half of a segment's frames and scored on the other, left about as much distance as none, so what remains moves within a section rather than across one.
- **The band measure is a proxy for the score.** Solved in the score's own bands, the solve's distance came within a few tenths of a decibel of what `listen` then measured.

## Other measures

The parity commands read three further measures from the same frames.

- **The noise read back** (`genshin:parity noise`) runs the noise solve over the notes we ship, twice: on the game's sound and on our render. The game's reading reproduces what ships, so where our reading parts from it, the solve and the player disagree about what a level means, and a band's bias there says nothing about the band until they agree. See [voices](../voices/design.md) for the solve.
- **The attacks** (`genshin:parity attacks`) count how often each octave band's level jumps by the attack threshold from one frame to the next, in our render and in the game's (`computeAttackShares`). The listening score cannot hear this: a band's mean gap reads a note that dies too soon and the next one striking over it the same as two notes ringing. The attacks measure what the ear reports, scattered single notes rather than a smooth line.
- **The decay** (`genshin:parity decay`) reads each band's gap by how long before it the last note began, so a band ringing over the game's shows by a note's age.

## Key files

| File                                                                      | Role                                                              |
| :------------------------------------------------------------------------ | :---------------------------------------------------------------- |
| `scripts/src/services/genshinParity/music/scoreMusicSegment.ts`           | Pitch agreement and each octave band's distance                   |
| `scripts/src/services/genshinParity/music/renderMusicSegments.ts`         | Each segment rendered by its screen, beside the game's            |
| `scripts/src/services/genshinParity/commands/noiseCommand.ts`             | The noise solve read back from our render and from the game's     |
| `scripts/src/services/genshinParity/commands/attacksCommand.ts`           | How often each band jumps between frames, ours against the game's |
| `scripts/src/services/genshinParity/music/computeAttackShares.ts`         | The share of a band's frames that jump                            |
| `scripts/src/services/genshinParity/commands/decayCommand.ts`             | Whether ours rings past the game's, band by band, by a note's age |
| `scripts/src/services/genshinParity/shared/ParityMusicScores.snapshot.md` | The last `listen`, committed                                      |
| `scripts/src/services/genshinParity/music/characterizeMusicBands.ts`      | What each band of the game's sound holds, for `bands`             |

## Sources

- [A Diffusion-Based Generative Equalizer for Music Restoration](https://arxiv.org/html/2403.18636), Moliner, Turunen, Elvander and Välimäki, section 3.4: the equaliser taken as the ratio of two long-term average spectra. A time average assumes the signal's balance holds throughout and weighs louder sections more, so it is a starting point rather than a remedy on its own, which is why no equaliser ships.
