# pitch-transcription

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

The notes played in a recording: each note's pitch, start, length, loudness and pitch bend, heard by Spotify's Basic Pitch model on the current TensorFlow.js and written as MIDI if you want a file. It hears several notes at once, on any instrument. The trained model ships with the package, and the step that turns the model's readings into notes imports without TensorFlow.js.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i pitch-transcription @tensorflow/tfjs
```

```ts
import { loadGraphModelSync } from "@tensorflow/tfjs";
import { readFile } from "node:fs/promises";
import {
  addPitchBends,
  convertNotesToSeconds,
  createNotes,
  MODEL_URL,
  MODEL_WEIGHTS_URL,
  readModel,
  writeMidi,
} from "pitch-transcription";

// Under Node, the model is built from its two files; in a browser, `await loadGraphModel(servedModelUrl)` instead
const [modelJson, weights] = await Promise.all([readFile(MODEL_URL, "utf8"), readFile(MODEL_WEIGHTS_URL)]);
const model = loadGraphModelSync([JSON.parse(modelJson), new Uint8Array(weights).buffer]);
// One channel at 22050 Hz as a Float32Array, or an AudioBuffer at 22050 Hz with any number of channels
const readings = await readModel(model, samples, (_windowReadings, progress) => console.log(progress));
const notes = createNotes(readings, { minNoteLength: 11 });
const bentNotes = addPitchBends(readings.contours, notes);
const timedNotes = convertNotesToSeconds(bentNotes);
// Each note's startTimeSeconds, durationSeconds, pitchMidi, amplitude and pitchBends
const midiBytes = writeMidi(timedNotes);
```

A worker or a server that already holds the readings imports note creation from `pitch-transcription/notes`, which never loads TensorFlow.js.

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/api/modules/pitch-transcription.html) to level up, and the [package's page](https://esposter.com/docs/pitch-transcription) for how it works and the absorption of `@spotify/basic-pitch` it replaced.

### Key exports

| Export                           | Role                                                                                                              |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `readModel`                      | The model's frame, onset and contour readings over a recording, a window at a time, each window's tensors freed   |
| `createNotes`                    | The readings turned into notes, with Basic Pitch's thresholds, inferred onsets, frequency range and melodia trick |
| `addPitchBends`                  | Each note's bend at every frame, in contour bins of a third of a semitone                                         |
| `convertNotesToSeconds`          | Notes timed in seconds rather than the model's frames                                                             |
| `writeMidi`                      | Notes as a MIDI file's bytes, each bend written as its share of the bend's range                                  |
| `MODEL_URL`, `MODEL_WEIGHTS_URL` | The shipped model's two files                                                                                     |

### Commands

Run from `packages/pitch-transcription/`:

```bash
pnpm build        # compile to dist/
pnpm test         # vitest watch mode (coverage is run from the repo root)
pnpm lint:fix     # auto-fix lint
pnpm typecheck    # type check
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE). It is derived from [basic-pitch-ts](https://github.com/spotify/basic-pitch-ts), Copyright 2022 Spotify AB, and ships its trained model unmodified, both under the Apache-2.0 license; see `NOTICE`.

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/pitch-transcription/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/pitch-transcription/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/pitch-transcription/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/pitch-transcription.svg
