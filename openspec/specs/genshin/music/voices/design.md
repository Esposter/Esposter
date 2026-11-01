# Music voices

The fit reads each decoded source into notes, keeps the notes the game's sound holds, splits them into three voices by register, and measures each voice's instrument and noise from the sound at its own notes `scripts/src/services/genshinAssets/shared/fitMusicVoices.ts`. The result is the record the [synthesizer](../synthesizer/design.md) plays. The fit runs in the scripts package; the [index](../README.md) holds the pipeline.

## Notes

- **The notes are transcribed from the game's own sound.** [pitch-transcription](../../../pitch-transcription/README.md) hears each decoded source at its defaults. Its readings are cached beside the source `scripts/src/services/genshinAssets/shared/readMusicSourceNotes.ts`, so a second fit takes seconds.
- **Bends are not carried, and the notes stay on whole pitches.** The model's contours read most frames a bin off the note's own, yet the fundamentals' peaks in the decoded sound sit within about a tenth of a semitone of their pitches, so the contours are not the music's tuning. That small offset is each voice's measured `tuning`, applied to the whole voice `scripts/src/services/genshinAssets/shared/fitInstrument.ts`.
- **Only the notes the game's sound holds.** Basic Pitch's decoding also follows whatever energy no onset claimed into notes of its own (the melodia trick, `packages/pitch-transcription/src/services/createNotes.ts`). In a dense mix that turns overtones and other voices' leftovers into notes the music never played, about a fifth of each piece's notes. `genshin:parity notes` `scripts/src/services/genshinParity/commands/notesCommand.ts` judges every note against the game's sound: our render with each note silenced in turn, the note's fundamental read in both (`computeNoteSupport`) `scripts/src/services/genshinParity/music/computeNoteSupport.ts`, and a note kept only where the game's level there stands over what every other note already gives. A note on an overtone of a lower one is no sign of a false note by itself, since the orchestra often doubles a line an octave up.
- **The pass runs once, under a fitted expression.** It compares levels, so it runs after the expression is fitted `scripts/src/services/genshinParity/commands/notesCommand.ts`. The voices stay as fitted over every transcribed note rather than being refitted over the kept notes alone: a refit over the kept notes moves the synthesizer's level without gaining pitch agreement, and a second pass moves neither piece (both are open, see Open).

## Registers

Each source's notes split into three registers at Fisher's natural breaks over their pitches, the exact least-spread split, so a new piece needs no hand-set pitches (see the Sources below) `scripts/src/services/genshinAssets/shared/splitVoicesByRegister.ts`. Each register is one voice. Telling two instruments apart within one register waits until the listening score ranks that loss the largest.

## Instruments

A voice's instrument is read from the decoded sound at its own notes, wherever every other sounding note's harmonics leave a partial clear (`fitInstrument`) `scripts/src/services/genshinAssets/shared/fitInstrument.ts`.

- Only a partial loud enough to move a reading covers it: one at or above `MUSIC_COVER_SHARE` of the reading's amplitude, since a quieter one shifts it by under a decibel (`scripts/src/services/genshinAssets/shared/constants.ts`, applied at `scripts/src/services/genshinAssets/shared/fitInstrument.ts`).
- A low note's harmonics past about the seventeenth lie closer than a semitone apart (12·log2((n+1)/n) is under 1 from n = 17, and 1.05 at n = 16), so counted at any level they would cover everything above them and leave the upper voices almost no clear readings. How loud each partial is comes from the voices' instruments, so the fit runs twice: first with every partial covering what it overlaps, then with each counted at the level its voice's first fit gives it `scripts/src/services/genshinAssets/shared/fitMusicVoices.ts`.
- The fit measures `scripts/src/services/genshinAssets/shared/fitInstrument.ts`:
  - each overtone's amplitude over the fundamental's at the peak, up to `MUSIC_HARMONIC_COUNT` harmonics and below `MUSIC_MAX_FREQUENCY` in `scripts/src/services/genshinAssets/shared/constants.ts`, short of the codec's cut at the transcription's half rate (that cut is open, see Open);
  - the attack, from the note's start to that peak;
  - the decay's time constant and the level it settles to, one fit in decibels to the notes' median level at each moment past their peaks;
  - the release's time constant after the note ends, over each note nothing sounds over as it fades;
  - the fundamental's level for a note of full velocity;
  - the tuning against A440.
- Each value is the median over the voice's clear notes `scripts/src/services/genshinAssets/shared/fitInstrument.ts`, so the few a transcription misreads, or another instrument covers, move none of them. A note whose peak sits under the noise of the voice's loudest is not measured at all.
- A window reads a peak low when a fast decay follows it, so the level is divided by the share of the peak the fitted envelope says a window catches `scripts/src/services/genshinAssets/shared/fitInstrument.ts`.
- An overtone with too few clear readings is left silent rather than guessed (`MUSIC_MIN_MEASUREMENTS` in `scripts/src/services/genshinAssets/shared/constants.ts`).
- The decay is fitted to a curve of medians rather than note by note `scripts/src/services/genshinAssets/shared/fitInstrument.ts`. A note's own few frames cannot tell a slow decay from a fast one that settles onto a level, and fitted note by note every voice died about twice as fast as its notes do in the game's sound (the factor is open, see Open): each note a short blip where the game's rings on.

The fit prints every value with how many notes it came from and its residual `scripts/src/services/genshinAssets/fit/fitLoginMusic.ts`.

## Noise

Noise covers every frequency, and no note in a piece sounds alone, so no note's noise can be read on its own. The noise is solved for every voice at once, band by band (`fitVoiceNoises`) `scripts/src/services/genshinAssets/shared/fitVoiceNoises.ts`.

- **Only the noise-like bands get noise.** In some octaves the game's sound is more noise than partials: its lowest two and its top two octaves read several times flatter than the tonal ones between, the lowest a quiet rumble and the top the breath, bow and room each voice is heard with. A band whose median flatness reads noise-like gets noise `scripts/src/services/genshinAssets/shared/fitVoiceNoises.ts` (`MUSIC_NOISE_MIN_FLATNESS` in `scripts/src/services/genshinAssets/shared/constants.ts`). In a tonal band, what lies off the partials is tones the transcription did not hear, and noise there would blur the pitch the score agrees on.
- **Each band's noise is read per frame.** Each octave band's noise is read in each frame from the median of its bins off every partial (`computePartialBinRanges`, as far out as a partial leaks through the window, carried through each note's ring) `scripts/src/services/genshinAssets/shared/computePartialBinRanges.ts`. It is modelled as the sum over the voices of each one's share times the power of its fundamentals sounding there.
- **The solve tells the voices apart by how their mix moves.** A least-squares solve works on how the mix moves from frame to frame `scripts/src/services/genshinAssets/shared/fitVoiceNoises.ts`, and Gauss-Newton on the logarithm of each frame's power refines it. A gap is then charged in decibels, as the listening score charges it, so a loud attack does not outweigh the frames between.
- **The solve runs in the score's own frames**, so the noise and the band measure judge a band by one flatness `scripts/src/services/genshinAssets/fit/fitLoginMusic.ts`.
- **Reverb is not the remedy.** A room's echo only spreads what a note already holds, so it cannot fill these bands (no run applying one is kept, see Open).

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

## Open

- [ ] **The fundamentals' peaks sit a small offset from their pitches, within about a tenth of a semitone** — no source yet: the per-voice `tuning` is measured in `scripts/src/services/genshinAssets/shared/fitInstrument.ts`, and the fit's report (`scripts/src/services/genshinAssets/fit/fitLoginMusic.ts`) must print each voice's value, but no printed fit is kept in the repo or under `{data-root}/genshin-parity`.
- [ ] **About a fifth of each piece's notes are notes the music never played** — no source yet: `scripts/src/services/genshinParity/commands/notesCommand.ts` drops them, and `pnpm -C scripts genshin:parity notes` must print the dropped share of each piece; no run output recording it is kept.
- [ ] **A second fit takes seconds, from the cached readings** — no source yet: the cache is cited (`scripts/src/services/genshinAssets/shared/readMusicSourceNotes.ts`), but no timing of a cached fit is kept; the login scene fit (`scripts/src/services/genshinAssets/fit/fitLoginScene.ts`) run twice, the second on the cache, would give it.
- [ ] **A refit over the kept notes moves the synthesizer's level without gaining pitch agreement, and a second pass moves neither piece** — no source yet: no run comparing the refit or the second pass is kept; `pnpm -C scripts genshin:parity listen` before and after each would show the pitch agreement and the distance.
- [ ] **The lowest two and the top two octaves of the game's sound read several times flatter than the tonal ones between** — no source yet: the band test is cited (`MUSIC_NOISE_MIN_FLATNESS`), but no per-band flatness reading of the game's sound is kept; `pnpm -C scripts genshin:parity bands` must print each octave's flatness, the two at each end several times the tonal ones.
- [ ] **The codec's cut sits at the transcription's half rate** — no source yet: the fit stops at `MUSIC_MAX_FREQUENCY`, but the game's codec cut is not measured from its decoded audio; the transcription reads at 22050 Hz (`packages/pitch-transcription/src/constants.ts`, line 4), so a spectrum of `{data-root}/genshin-parity/extracted/login/music/1045584607.wav` must show its fall at 11025 Hz.
- [ ] **Fitted note by note, every voice died about twice as fast as its notes do in the game's sound** — no source yet: the curve-of-medians fit is cited (`scripts/src/services/genshinAssets/shared/fitInstrument.ts`), but no per-voice decay comparison is kept; each voice's decay constant fitted both ways, beside the game's, would show it.
- [ ] **A room's echo cannot fill the noise bands, since it only spreads what a note already holds** — no source yet: no run applying a reverb pass to the fit is kept; `pnpm -C scripts genshin:parity noise` on a reverbed render must print each noise band still short of the game's, and the argument is the page's own.
- [ ] **Telling two instruments apart within one register waits until the listening score ranks that loss the largest** — no source yet: the listening score's loss ranking is not in the scripts package's notes command or the fit code cited here, and `scripts/src/services/genshinParity/commands/listenCommand.ts` reports per segment only, so a per-register run is needed.
- [ ] **The orchestra often doubles a line an octave up** — no source yet: no run output of `genshin:parity notes` recording the doubled lines in the game's sound is kept; the run must print each kept note an octave above a lower kept note, with the game's level at each.
