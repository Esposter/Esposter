# pitch-transcription

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

The notes played in a recording: each note's pitch, start, length, loudness and pitch bend, heard by Spotify's Basic Pitch model on ONNX Runtime and written as MIDI if you want a file. It hears several notes at once, on any instrument. The trained model ships with the package, and the step that turns the model's readings into notes imports without ONNX Runtime.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i pitch-transcription onnxruntime-common onnxruntime-node
```

```ts
import { InferenceSession } from "onnxruntime-node";
import { fileURLToPath } from "node:url";
import {
  addPitchBends,
  convertNotesToSeconds,
  createNotes,
  MODEL_URL,
  readModel,
  writeMidi,
} from "pitch-transcription";

// Under Node, the session reads the shipped model file; in a browser, `InferenceSession.create(servedModelUrl)` from `onnxruntime-web` instead
const session = await InferenceSession.create(fileURLToPath(MODEL_URL));
// One channel at 22050 Hz as a Float32Array, or an AudioBuffer at 22050 Hz with any number of channels
const readings = await readModel(session, samples, (_windowReadings, progress) => console.log(progress));
const notes = createNotes(readings, { minNoteLength: 11 });
const bentNotes = addPitchBends(readings.contours, notes);
const timedNotes = convertNotesToSeconds(bentNotes);
// Each note's startTimeSeconds, durationSeconds, pitchMidi, amplitude and pitchBends
const midiBytes = writeMidi(timedNotes);
```

A worker or a server that already holds the readings imports note creation from `pitch-transcription/notes`, which never loads ONNX Runtime. `pitch-transcription` takes `onnxruntime-common` as a peer, and the runtime the session runs on is yours to choose: `onnxruntime-node` under Node, `onnxruntime-web` in a browser.

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://github.com/Esposter/Esposter/tree/main/openspec/specs/pitch-transcription) to level up. It explains how the package works and how it absorbed `@spotify/basic-pitch`.

### Key exports

| Export                  | Role                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `readModel`             | The model's frame, onset and contour readings over a recording, a window at a time, each output disposed once read |
| `createNotes`           | The readings turned into notes, with Basic Pitch's thresholds, inferred onsets, frequency range and melodia trick  |
| `addPitchBends`         | Each note's bend at every frame, in contour bins of a third of a semitone                                          |
| `convertNotesToSeconds` | Notes timed in seconds rather than the model's frames                                                              |
| `writeMidi`             | Notes as a MIDI file's bytes, each bend written as its share of the bend's range                                   |
| `MODEL_URL`             | The shipped model file, Basic Pitch's ONNX export                                                                  |

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
