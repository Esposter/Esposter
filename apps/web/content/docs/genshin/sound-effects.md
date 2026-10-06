---
title: Sound effects
description: The game's sounds beside its music, the login's door first. Each is found among the game's own sounds by matching them against a recording that plays it, measured as its noise's level in each octave band over time, and played by the engine's own noise from those levels alone, a measured delay after what sets it off.
---

# Sound effects

The login's door sounds as it opens, and so does ours. The game's own sounds stay on the machine that measures them; each sound's levels and the engine's noise that plays them are what ships.

## How it works

```mermaid
flowchart TD
  R["A recording that plays the sound"] --> W["The window it sounds in, over the music before it"]
  P["Minimum.pck"] --> D["Every sound of its banks, decoded"]
  D --> M["Each scored against the window by its octave bands' envelopes, at every start"]
  W --> M
  M --> S["The sounds that play, their starts and their levels"]
  S -->|"fit: fitLoginDoorSound"| L["login/sounds.json: each band's level every 25 ms"]
  L -->|"computeSoundEffectSamples"| N["Our noise, each octave band at its level"]
  N --> A["Web Audio, a measured delay after the click"]
```

- **A sound is found by the recording that plays it.** A sound has no name, only an id, so the door's are found by matching: every sound of `Minimum.pck` ([game data formats](/docs/genshin/game-data-formats)), whose bank holds the login's own sounds, is scored against the door recording's burst by its octave bands' envelopes from 1 kHz to 8 kHz, at every start, over the music's level before the click. Two score highest, a rumble and a broadband rush, and fitted together they explain the burst best with both at the level they are stored at, the rush a tenth of a second after the rumble. Where each sound sits is the login music's reference (`Login/Music/Index.reference.ts`), and every search for them its door sound topic (`DoorSound.reference.ts` beside it).
- **A sound with no pitch is its bands' levels.** Neither door sound holds a harmonic series, so each is noise whose level moves in each octave band of `MUSIC_NOISE_BAND_CENTRES`. The fit reads each band's power every 25 milliseconds from the decoded sound's spectrum, a Hann window of 2048 samples over its own power, so each level is the noise's standard deviation in that band, and sums the two sounds' powers at their offset, since noise apart adds its power. Its levels keep five decimals, a hundred decibels under full scale, so the tail dies away as the game's does.
- **The engine plays its own noise.** `computeSoundEffectSamples` sounds each band as its own seamless noise (`computeNoiseSamples`, that band alone), looped as long as the sound lasts, its level read between the fit's frames linearly, and the bands summed; `createSoundEffectBuffer` renders it once when the login's audio starts. Rendered so, the door's sound explains the recording's burst as well as the game's own two sounds do, within about three decibels across the bands and frames.
- **It sounds when the game's does.** The login's music component owns the one audio context, and the door's sound starts `LOGIN_DOOR_SOUND_DELAY_MS` after the click, 0.32 seconds, the time from the recording's first whitened frame to the rumble's rise.

## Not yet

- **The login's other sounds.** The clicks on its buttons and the wind each wait on a recording that plays them clearly enough to match, and go through the same fit.
- **A command for the match.** The door's sounds were matched by a scratch pass over `Minimum.pck`; a second sound to find is when the match becomes a `genshin:assets` command beside `music`.

## Key files

| File                                                                   | Role                                                            |
| :--------------------------------------------------------------------- | :-------------------------------------------------------------- |
| `packages/genshin-engine/src/audio/computeSoundEffectSamples.ts`       | A sound effect as our noise, each band at its levels over time  |
| `packages/genshin-engine/src/audio/createSoundEffectBuffer.ts`         | A sound effect rendered once into a buffer                      |
| `scripts/src/services/genshinAssets/fit/fitLoginDoorSound.ts`          | The door's two sounds read from the game and measured as levels |
| `scripts/src/services/genshinAssets/music/parseSoundBankSounds.ts`     | The sounds a sound bank holds in itself                         |
| `packages/genshin-world/src/components/Login/Music/Index.vue`          | The login's music and its door's sound, through one context     |
| `packages/genshin-world/src/components/Login/Music/Index.reference.ts` | Where the door's sounds sit, and their topic of every search    |

## Sources

- [GENSHIN IMPACT | CELESTIA DOOR | LOADING SCREEN](https://www.youtube.com/watch?v=rBnfA4pXw6U): the English client's door, clicked, with its sound.
