# Music

Read when recreating a piece of the game's music, or when changing the fit, the player or the listening score. How it works and why is `apps/web/content/docs/genshin/music.md`. This page is the order a new piece takes and the rules each step keeps.

## A new piece, in order

1. **Find its sound.** Take a recording of the screen with its music: a public video first (the `genshin-parity` skill's search-before-recording rule), the game's own capture only when nothing published has it. Run `pnpm -C scripts genshin:assets music <recording>`. A sound that leads window after window, its start advancing in step with the recording, is the one playing. The command prints each sound's segments and the playlists ordering them.
2. **Name its playlist.** The playlist holding every sound the recording plays is the piece. Its Wwise id goes in the component's `DerivedAssetComponentMap` entry as `musicPlaylistId`, with a comment on how it was found.
3. **Export it.** `genshin:assets playlist <component>` resolves one pass of the playlist into its segments and decodes their sources beside the exports. A playlist holding a random group refuses to resolve, rather than guessing an order: that piece needs its group's rule read before it goes further.
4. **Fit it.** The component's fit calls its music fit and writes the data beside its other fits (`fitLoginMusic` and `login/music.json` are the pattern). Read the fit's report before the data. It gives:
   - each source's note count and its register splits;
   - each voice's clear-note count, harmonics, envelope and residuals, level, noise and tuning.
5. **Play it.** A component that renders nothing creates an `AudioContext`, starts the engine's `createMusicPlayer` over the data, and resumes on the first pointer or key (`Login/Music`). Its fixture is `isMotionOnly`, which puts it on the parity page for scoring.
6. **Score it.** `genshin:parity listen` renders each segment offline through that screen and scores it against the game's own decoded sound. Commit `ParityMusicScores.snapshot.md` with the change that moved it.
7. **Hand it to the user's ear.** The session cannot hear. The numbers say what changed, and the user approves how it sounds.

## Rules

- **Nothing of the game's audio ships**, in any format. The sources and the readings cached beside them stay in the references folder. What ships is the notes, the structure and each voice's fitted instrument.
- **The structure is exact, from the banks.** A segment's length, its clips' trims, the rests and the order come from the sound banks, never from a recording. A recording only finds which playlist it is.
- **Notes come from the game's decoded source, never a recording.** A recording carries the interface's sounds and a codec's losses.
- **An instrument is fitted, never chosen or tuned by ear.** A value a fit cannot measure is left out, as a harmonic with too few clear readings is, rather than filled in.
- **The next pass is the largest loss `listen` reports, read by its sign.** A band's bias says whether ours leaves it short or overfills it, and `genshin:parity bands` says what the game's band holds, which together decide the remedy before any is tried: a band short where the game is noise-like (flat, much of it off our partials) wants noise, one short where it lies on our partials wants their level, and reverb only spreads what a note already holds. Instruments told apart within a register and dynamics within a note each wait until the score ranks them first (the `recreation-tooling` skill's gain-first rule).
- **A value every sounding note feeds is solved over all the voices at once**, as their noise is (`fitVoiceNoises`): no note in a piece sounds alone, so reading it at one note charges that note with the rest. The solve is fitted in decibels, the score's own measure, since a fit in power is pulled by the loud attacks, and in the score's own frames, since a band of a few bins reads flatter than it is.
- **Noise only where the game's band is noise-like** (`MUSIC_NOISE_MIN_FLATNESS`, why on the music page), and **a pass that lowers pitch agreement is a regression**, whatever the bands gain.
- **A bend the transcription reads is not a tuning.** Basic Pitch's contours read most frames a bin off the note, while the decoded sound's fundamentals sit within a tenth of a semitone of their pitches. Tuning is measured from the fundamentals' peaks in the decoded sound and carried by the instrument, so notes stay on whole pitches.
- **Every instrument value is a median over notes, never one fit pooled across them.** A transcription misreads some notes and another voice covers others; pooled, a handful of them decides the curve.
