---
title: Music
description: The game's music re-derived and played in the browser, the login's first. Its playlist is read exactly from the game's sound banks, its notes are transcribed from the game's own decoded sound, each register's instrument, overtones and noise are measured from that sound, and the engine's own synthesizer plays the score. A listening score compares our render with the game's sound, segment by segment, by pitch and by octave band, each band's gap signed.
---

# Music

The login plays its music, and so does ours. The game's audio is a reference, read locally from the installed game and never shipped. What ships is ours: the playlist's structure, the notes, each voice's measured instrument, and a synthesizer that plays them. The login came first, and every step is a command or a fit any other piece of the game's music goes through the same way.

## How it works

```mermaid
flowchart TD
  R["A recording of the screen"] -->|"genshin:assets music"| S["Which sounds it plays, and the playlist ordering them"]
  S --> M["The playlist's id in the component's map"]
  B["The game's sound banks and music packages"] -->|"genshin:assets playlist"| P["The playlist's segments in order, its sources decoded"]
  M --> P
  P -->|"fit: pitch-transcription"| N["Each source's notes"]
  N -->|"fit: natural breaks"| V["Three voices by register"]
  P --> I
  V -->|"fit: fitInstrument"| I["Each voice's instrument: harmonics, envelope, level, tuning"]
  V -->|"fit: fitVoiceNoises, every voice at once"| I
  V --> J["login/music.json: segments, voices, notes, instruments"]
  I --> J
  J --> E["The engine's player: notes scheduled ahead of the audio clock"]
  E --> W["Web Audio, while the login shows"]
  J -->|"genshin:parity listen"| L["An offline render on the parity page"]
  P --> L
  L --> C["Each segment's pitch agreement and octave-band distance"]
```

- **The structure is exact.** The login's playlist is a continuous sequence that loops forever: a first piece of 104 seconds, a silent segment of about ten seconds, a second piece of 92.75 seconds (its source's last 2.25 seconds trimmed), and the rest again. Every length, trim and the order come from the sound banks (`genshin:assets playlist`), so the handoffs land where the game's do. A recording only found which playlist it is.
- **The notes are transcribed from the game's own sound.** [pitch-transcription](/docs/pitch-transcription) hears each decoded source at its defaults: about a thousand notes in the first piece and about six hundred in the second. Its readings are cached beside the source, so a second fit takes seconds. Bends are not carried. The model's contours read most frames a bin off the note's own, yet the fundamentals' peaks in the decoded sound sit within about a tenth of a semitone of their pitches, so the contours are not the music's tuning. That small offset is each voice's measured `tuning`, and the notes stay on whole pitches.
- **Voices by register.** Each source's notes split into three registers at Fisher's natural breaks over their pitches, the exact least-spread split, so a new piece needs no hand-set pitches. Telling two instruments apart within one register waits until the listening score ranks it the largest loss.
- **Every instrument is measured.** A voice's instrument is read from the decoded sound at its own notes, wherever every other sounding note's harmonics leave a partial clear (`fitInstrument`):
  - each overtone's amplitude over the fundamental's at the peak, to the thirty-second harmonic and below 10 kHz, short of the codec's cut at the transcription's half rate;
  - the attack, from the note's start to that peak;
  - the decay's time constant and the level it settles to, a least-squares fit over each clear note;
  - the release's time constant after the note ends, over each note nothing sounds over as it fades;
  - the fundamental's level for a note of full velocity;
  - the tuning against A440.

  Each is the median over the voice's clear notes, so the few a transcription misread, or another instrument covers, move none of them. A note whose peak sits under the noise of the voice's loudest is not measured at all. A window reads a peak low when a fast decay follows it, so the level is divided by the share of the peak the fitted envelope says a window catches. An overtone with too few clear readings is left silent rather than guessed. The fit prints every value with how many notes it came from and its residual.

- **Every voice's noise is solved at once.** Above 5 kHz the game's sound is more noise than partials: its spectrum is several times flatter than the octaves below and, in the first piece, loudest at the notes' attacks, the breath, bow and room each voice is heard with. That noise covers every frequency and no note in the piece sounds alone, so no note's noise can be read on its own. Instead `fitVoiceNoises` takes each frame's noise power from its median bin in that range, where no partial moves it, as the sum over the voices of each one's share times the power of its fundamentals sounding there. A least-squares solve tells the voices apart by how their mix moves from frame to frame, and Gauss-Newton on the logarithm of each frame's power refines it, so a gap is charged in decibels as the listening score charges it and a loud attack does not outweigh the frames between. Reverb could not fill that range: a room's echo only spreads what a note already holds, and the notes held nothing there.
- **Our own synthesizer, in the engine.** `genshin-engine`'s audio module plays each note as an oscillator over its instrument's harmonics, and its instrument's white noise from a looped buffer, through one gain following its envelope. The envelope's value at the note's end is worked out rather than held with `cancelAndHoldAtTime`, which Firefox lacks. `createMusicPlayer` schedules the notes due in the next two seconds every half second and loops the playlist. `renderMusicSegment` renders one segment offline through the same notes. The login's score and instruments are the world package's data (`login/music.json`).
- **It starts as soon as the browser lets it.** `LoginMusic` renders nothing. It starts the player as the login screen mounts and stops it when the screen goes. The browser's autoplay policy decides whether a new audio context runs or starts suspended, so when it starts suspended the music waits for the first pointer press or key press anywhere on the window — on the title, usually its own click — and starts there from its beginning.
- **Measured by a listening score, approved by ear.** `genshin:parity listen` renders each segment offline on the parity page, through the screen that plays it, and scores it against the game's decoded segment. The pitch agreement is the mean dot product of the two's pitch classes over the game's audible frames, 1 when every frame names the same notes in the same balance. The distance is each octave band's mean level gap in decibels, from 63 Hz to 8 kHz, which charges timbre and loudness alike, and each band's bias is that gap signed, under 0 where ours is the quieter, which tells a band ours leaves short from one it overfills. The report is committed as `ParityMusicScores.snapshot.md`. The score agrees on pitch about four frames in five or better in both pieces. The bands sit under ten decibels off on average, the top two octaves near the middle ones since the overtones and the noise filled them; the second piece's lowest band and the first piece's 2 kHz band are the furthest, both short. The session cannot hear, so the numbers say what changed and the user's ears say whether it sounds right.

## Recreating another piece

The order, and the rules each step keeps, are the `genshin-parity` skill's `references/music.md`:

1. Find the sound with `genshin:assets music <recording>` over a recording of the screen.
2. Name its playlist in the component's map (`musicPlaylistId`).
3. Export it with `genshin:assets playlist <component>`.
4. Fit it through the component's fit, after `fitLoginMusic`.
5. Play it from a component that renders nothing, after `Login/Music`, with an `isMotionOnly` fixture.
6. Score it with `listen`.
7. The user listens.

## Not yet

- **The passes the score orders.** The largest loss is the second piece's lowest band, which ours leaves well short, then the first piece's 2 kHz band. After them come instruments told apart within a register, and the dynamics within a note that the median envelope flattens. Each is taken when `listen` ranks it the largest loss ([roadmap](/docs/genshin/roadmap)).
- **Sound effects.** The door's opening, the clicks and the wind are sounds rather than music, and each is a page of its own when its turn comes.

## Key files

| File                                                               | Role                                                            |
| :----------------------------------------------------------------- | :-------------------------------------------------------------- |
| `scripts/src/services/genshinAssets/extractComponentPlaylist.ts`   | A component's playlist resolved from the banks, sources decoded |
| `scripts/src/services/genshinAssets/fitLoginMusic.ts`              | The login's notes, voices and instruments                       |
| `scripts/src/services/genshinAssets/readMusicSourceNotes.ts`       | A source's notes, its readings cached                           |
| `scripts/src/services/genshinAssets/splitVoicesByRegister.ts`      | The registers' natural breaks                                   |
| `scripts/src/services/genshinAssets/fitInstrument.ts`              | A voice's instrument measured at its clear notes                |
| `scripts/src/services/genshinAssets/fitVoiceNoises.ts`             | Every voice's noise, solved over every frame at once            |
| `scripts/src/services/genshinAssets/readSpectralPeak.ts`           | A partial's frequency and height between two bins               |
| `scripts/src/services/genshinParity/scoreMusicSegment.ts`          | Pitch agreement and each octave band's distance                 |
| `scripts/src/services/genshinParity/ParityMusicScores.snapshot.md` | The last `listen`, committed                                    |
| `packages/genshin-engine/src/audio/createMusicPlayer.ts`           | The live player                                                 |
| `packages/genshin-engine/src/audio/scheduleMusicNote.ts`           | One note's oscillator and envelope                              |
| `packages/genshin-world/src/components/Login/Music/Index.vue`      | Where the login's music plays                                   |

## Sources

- [bnnm/wwiser](https://github.com/bnnm/wwiser) — the reference parser for Wwise's banks, read to confirm the track's clips and the playlist's items at the banks' version.
- [vgmstream](https://github.com/vgmstream/vgmstream) — the decoder for Wwise's Vorbis, pinned in the scripts' cache.
- [Autoplay guide for media and Web Audio APIs](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay), MDN — when a browser starts an audio context suspended until the page's first click or key.
- [Jenks natural breaks optimization](https://en.wikipedia.org/wiki/Jenks_natural_breaks_optimization) — the least-spread split of a list into ranges, which the registers follow.
