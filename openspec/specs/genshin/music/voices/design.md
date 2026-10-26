# Music voices

The fit reads each decoded source into notes, keeps the notes the game's sound holds, splits them into three voices by register, and measures each voice's instrument and noise from the sound at its own notes. The result is the record the [synthesizer](../synthesizer/design.md) plays. The fit runs in the scripts package; the [index](../README.md) holds the pipeline.

## Notes

- **The notes are transcribed from the game's own sound.** [pitch-transcription](../../../pitch-transcription/README.md) hears each decoded source at its defaults. Its readings are cached beside the source, so a second fit takes seconds.
- **Bends are not carried, and the notes stay on whole pitches.** The model's contours read most frames a bin off the note's own, yet the fundamentals' peaks in the decoded sound sit within about a tenth of a semitone of their pitches, so the contours are not the music's tuning. That small offset is each voice's measured `tuning`, applied to the whole voice.
- **Only the notes the game's sound holds.** Basic Pitch's decoding also follows whatever energy no onset claimed into notes of its own (the melodia trick). In a dense mix that turns overtones and other voices' leftovers into notes the music never played, about a fifth of each piece's notes. `genshin:parity notes` judges every note against the game's sound: our render with each note silenced in turn, the note's fundamental read in both (`computeNoteSupport`), and a note kept only where the game's level there stands over what every other note already gives. A note on an overtone of a lower one is no sign of a false note by itself, since the orchestra often doubles a line an octave up, so the pass keeps such a note wherever the game's sound stands over our render with it silenced.
- **The pass runs once, under a fitted expression.** It compares levels, so it runs after the expression is fitted. The voices stay as fitted over every transcribed note rather than being refitted over the kept notes alone: a refit over the kept notes moves the synthesizer's level without gaining pitch agreement, and a second pass moves neither piece.

## Registers

Each source's notes split into three registers at Fisher's natural breaks over their pitches, the exact least-spread split, so a new piece needs no hand-set pitches (see the Sources below). Each register is one voice. Telling two instruments apart within one register waits until the listening score ranks that loss the largest.

## Instruments

A voice's instrument is read from the decoded sound at its own notes, wherever every other sounding note's harmonics leave a partial clear (`fitInstrument`).

- Only a partial loud enough to move a reading covers it: one a tenth of the reading's amplitude or more, since a quieter one shifts it by under a decibel.
- A low note's harmonics past about the seventeenth lie closer than a semitone apart, so counted at any level they would cover everything above them and leave the upper voices almost no clear readings. How loud each partial is comes from the voices' instruments, so the fit runs twice: first with every partial covering what it overlaps, then with each counted at the level its voice's first fit gives it.
- The fit measures:
  - each overtone's amplitude over the fundamental's at the peak, to the thirty-second harmonic and below 10 kHz, short of the codec's cut at the transcription's half rate;
  - the attack, from the note's start to that peak;
  - the decay's time constant and the level it settles to, one fit in decibels to the notes' median level at each moment past their peaks;
  - the release's time constant after the note ends, over each note nothing sounds over as it fades;
  - the fundamental's level for a note of full velocity;
  - the tuning against A440.
- Each value is the median over the voice's clear notes, so the few a transcription misreads, or another instrument covers, move none of them. A note whose peak sits under the noise of the voice's loudest is not measured at all.
- A window reads a peak low when a fast decay follows it, so the level is divided by the share of the peak the fitted envelope says a window catches.
- An overtone with too few clear readings is left silent rather than guessed.
- The decay is fitted to a curve of medians rather than note by note. A note's own few frames cannot tell a slow decay from a fast one that settles onto a level, and fitted note by note every voice died about twice as fast as its notes do in the game's sound: each note a short blip where the game's rings on.

The fit prints every value with how many notes it came from and its residual.

## Noise

Noise covers every frequency, and no note in a piece sounds alone, so no note's noise can be read on its own. The noise is solved for every voice at once, band by band (`fitVoiceNoises`).

- **Only the noise-like bands get noise.** In some octaves the game's sound is more noise than partials: its lowest two and its top two octaves read several times flatter than the tonal ones between, the lowest a quiet rumble and the top the breath, bow and room each voice is heard with. A band whose median flatness reads noise-like gets noise. In a tonal band, what lies off the partials is tones the transcription did not hear, and noise there would blur the pitch the score agrees on.
- **Each band's noise is read per frame.** Each octave band's noise is read in each frame from the median of its bins off every partial (`computePartialBinRanges`, as far out as a partial leaks through the window, carried through each note's ring). It is modelled as the sum over the voices of each one's share times the power of its fundamentals sounding there.
- **The solve tells the voices apart by how their mix moves.** A least-squares solve works on how the mix moves from frame to frame, and Gauss-Newton on the logarithm of each frame's power refines it. A gap is then charged in decibels, as the listening score charges it, so a loud attack does not outweigh the frames between.
- **The solve runs in the score's own frames**, so the noise and the band measure judge a band by one flatness.
- **Reverb is not the remedy.** A room's echo only spreads what a note already holds, so it cannot fill these bands.

## Key files

| File                                                                 | Role                                                              |
| :------------------------------------------------------------------- | :---------------------------------------------------------------- |
| `scripts/src/services/genshinAssets/shared/readMusicSourceNotes.ts`  | A source's notes, its readings cached                             |
| `scripts/src/services/genshinAssets/shared/splitVoicesByRegister.ts` | The registers' natural breaks                                     |
| `scripts/src/services/genshinAssets/shared/fitMusicVoices.ts`        | A source's voices by register, each one's instrument fitted twice |
| `scripts/src/services/genshinAssets/shared/fitInstrument.ts`         | A voice's instrument measured at its clear notes                  |
| `scripts/src/services/genshinAssets/shared/fitVoiceNoises.ts`        | Every voice's noise in each noise-like band, solved at once       |
| `scripts/src/services/recreation/signal/computeSpectralPeak.ts`      | A partial's frequency and height between two bins                 |
| `scripts/src/services/genshinParity/commands/notesCommand.ts`        | Every note the game's sound does not hold, dropped                |
| `scripts/src/services/genshinParity/music/computeNoteSupport.ts`     | How far the game stands over our render at a note's fundamental   |

## Sources

- [An introduction to additive synthesis](https://www.soundonsound.com/techniques/introduction-additive-synthesis), Sound on Sound: each harmonic under an envelope of its own, the basis of the per-overtone amplitudes the fit measures.
- [Jenks natural breaks optimization](https://en.wikipedia.org/wiki/Jenks_natural_breaks_optimization): the least-spread split of a list into ranges, which the registers follow.
