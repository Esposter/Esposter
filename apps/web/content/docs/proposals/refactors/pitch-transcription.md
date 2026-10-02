---
title: pitch-transcription
description: Proposal — absorb Spotify's basic-pitch into a package of our own, pitch-transcription, at parity or better, on the current TensorFlow.js major rather than the one upstream stopped at, with its trained model shipped and exported, its note creation usable without TensorFlow.js, stereo input mixed down as its docs promise, and every issue on its tracker given a verdict.
model: claude-opus-5-5
---

# pitch-transcription

Automatic music transcription turns a recording into the notes played in it: each note's pitch, when it starts, how long it is held and how loud it is. Spotify's Basic Pitch does it with a small trained neural network that hears several notes at once, and `@spotify/basic-pitch` is its TypeScript port: the network's published weights, the audio preparation it runs them on through TensorFlow.js, and the step after it that turns the network's three outputs — a frame, onset and pitch-contour reading for every note at every moment — into notes and MIDI. The [Genshin music](/docs/proposals/genshin/music) proposal transcribes the game's own music with it, which is where it first enters the workspace.

It is absorbed into a new publishable package, `pitch-transcription`, through the flow in [dependency admission](/docs/architecture/dependency-admission). It is not an adapter in that page's strict sense, since its two dependencies, TensorFlow.js and `@tonejs/midi`, are not otherwise in the catalog. The cost it charges is the second of that page's three: a version we do not control.

## What it costs

- **A held engine.** The package depends on `@tensorflow/tfjs` 3.x. It loads its network through that copy and runs it on tensors from that copy, so a consumer that loads the network through its own copy must hold its own TensorFlow.js at the same major, or the network receives tensors from another engine. The current major is 4. Upstream has not moved since 2023, and the request to move it is open on its tracker as an issue (#20) and a pull request (#21), beside a bot's bump within 3.x (#13) that never merged either.
- **A model the package does not hand out.** The weights ship inside the published package (#5) but are not exported, so every consumer finds them by path inside `node_modules` (#18). Under Node there is also no file loader in the browser build of TensorFlow.js, so each consumer reads the two files and builds the model from memory itself.
- **Note creation tied to TensorFlow.js.** The step after the network is plain arithmetic over three arrays, but it is only importable from the entry that loads TensorFlow.js, so a worker that only builds notes pays for the engine anyway (#19).

## Gate

Read through the admission test's chain:

- **Not spec-tracking.** Basic Pitch is a model and its post-processing, defined by nothing that changes without us. The MIDI file format is a specification, and its writer stays a dependency (`@tonejs/midi`), the stop list's first rule.
- **Not security-shaped, and not accessibility-shaped.**
- **The engine and the data are kept.** TensorFlow.js runs the network, and the network's trained weights are Spotify's data, published under Apache-2.0 and shipped with their notice. Neither is rewritten: re-implementing the network's layers or retraining it is exactly the expensive mistake the precedent warns against. What is taken back is the layer between them, the audio preparation, the network's call and the note creation, which is where every cost above lives.
- **Its surface is smaller than the code it costs us.** The package is one class and four functions, under a thousand lines with its constants.

## Scope

**Parity with the package's surface**, measured against its current release, never a shape it deprecated:

- `BasicPitch`: constructed from a loaded model or a model's URL, `evaluateModel` over a mono `Float32Array` or an `AudioBuffer` at 22050 Hz with its result and progress callbacks, the frame, onset and contour readings it hands back, and its public steps `prepareData`, `evaluateSingleFrame`, `unwrapOutput` and `adjustNoteStart`.
- `outputToNotesPoly`, with every one of its options: the onset and frame thresholds, the shortest note, inferred onsets, the frequency range, the melodia trick and the energy tolerance.
- `addPitchBendsToNoteEvents` and `noteFramesToTime`.
- `generateFileData`, which upstream keeps internal (#25), exported, returning bytes a browser can hold rather than Node's `Buffer`.

**Beyond parity:**

- **The current TensorFlow.js major**, its version the catalog's, so Renovate moves it like any other dependency.
- **The model exported**: its files' location for a server or a bundler to serve, and a loader that builds it from those files under Node.
- **Note creation without TensorFlow.js**: a second entry holding the step after the network alone, for a worker or a server that only builds notes.
- **Stereo input mixed down.** Upstream's docs say stereo is mixed down, and its code refuses it (#9); the replacement averages the channels.
- **The website's shortest note as the default**: eleven frames, the length the Basic Pitch site uses, which an open pull request asks for (#8).

**Swap** — the Genshin music fit is the first consumer; `scripts` depends on `pitch-transcription` and never on `@spotify/basic-pitch`, so the catalog never holds the upstream package or a TensorFlow.js held back for it.

**Documentation** — a published package, so a README to the `readme-standards` skill whose Getting Started is the install and one recording transcribed, and a docs section at `/docs/pitch-transcription` holding how it works, with a diagram of the network's three readings becoming notes, the Upstream table below with its evidence, and its Sources; and a row in both package inventories.

**Speed** — the note creation runs over every frame of a recording, so it carries a bench at two lengths of recording against upstream's (the `bench` skill).

## Upstream

The tracker is small and was read whole, issues and pull requests with every comment, before this page was written. Each verdict goes onto the package's docs page with its evidence when it ships; the starting verdicts:

| Item                                      | Verdict                                                                                                                                                                                                                                                                                                                                         |
| :---------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #20, #21, #13 — update TensorFlow.js      | In scope: built on the current major, which supersedes #13's bump within 3.x                                                                                                                                                                                                                                                                    |
| #18 — the model is not exported           | In scope, feature: the model's files and a loader exported                                                                                                                                                                                                                                                                                      |
| #25 — export `generateFileData`           | In scope, feature                                                                                                                                                                                                                                                                                                                               |
| #9 — stereo input refused                 | In scope, defect: the channels averaged, its regression test failing against upstream first                                                                                                                                                                                                                                                     |
| #8 — shortest note default                | In scope: eleven frames                                                                                                                                                                                                                                                                                                                         |
| #19 — the main thread held                | In scope, feature: note creation importable without TensorFlow.js; running the network off the main thread is the consumer's, in a worker of its own                                                                                                                                                                                            |
| #17 — the pitch bends' units              | In scope, defect: a bend is the note's offset in contour bins, a third of a semitone each, one per frame, and `generateFileData` writes that count as a MIDI bend's value, which `@tonejs/midi` reads as a share of the bend's range; the file is written with the bend's share and its units are documented. Reproduced against upstream first |
| #22 — no transcription on newer iPhones   | Out of scope: TensorFlow.js's WebGL backend on those GPUs; our side is a model accepted already loaded, so a consumer picks the WebAssembly backend before loading it, as the comments found                                                                                                                                                    |
| #23 — `Long.fromString is not a function` | Out of scope: TensorFlow.js's hashing under a bundler's interop with `long`; checked against the current major in the package's own browser build                                                                                                                                                                                               |
| #24 — a TensorFlow Lite model             | Out of scope: which network is trained and published is the Basic Pitch model repository's, not the port's                                                                                                                                                                                                                                      |
| #12 — real time                           | Out of scope: the network reads overlapping windows of seconds, which the model repository's own issue explains                                                                                                                                                                                                                                 |
| #7 — spreading a non-iterable             | False positive: a usage slip, the readings accumulated a level flat, which the comment's fix shows; the README shows the accumulation                                                                                                                                                                                                           |
| #6, #10, #16 — examples and docs          | False positive, documentation: the README and the docs section carry the usage, the sample rate and the mono input                                                                                                                                                                                                                              |
| #1–#5, #11 — release housekeeping         | False positive: no behaviour; #5's bundled model is carried                                                                                                                                                                                                                                                                                     |

### Found in the source

Reading the source turned up defects nobody has filed. Each is in scope, reproduced against upstream first, and given a regression test:

- **No tensor is ever disposed.** `evaluateModel` frames the whole recording, slices it, runs each window and reads back its outputs without a `tidy` or a `dispose`, so memory grows with the recording's length, on a GPU backend as GPU memory. The replacement frees each window's tensors once its readings are read.
- **Windows past the end still run.** Once the readings cover the recording, the loop skips the rest of the windows only after running each through the network. The replacement stops there.
- **`adjustNoteStart` renames a field.** It returns `pitch_midi` where every other function's notes say `pitchMidi`, so its output is not the note type it claims.

## Key files

| File                   | What changes                                                               |
| :--------------------- | :------------------------------------------------------------------------- |
| `pnpm-workspace.yaml`  | TensorFlow.js and `@tonejs/midi` enter the catalog at their current majors |
| `scripts/package.json` | depends on `pitch-transcription`                                           |

## Sources

- [spotify/basic-pitch-ts](https://github.com/spotify/basic-pitch-ts) — the package absorbed, its tracker and its Apache-2.0 licence.
- [spotify/basic-pitch](https://github.com/spotify/basic-pitch) — the model's own repository, and its issue on real-time transcription.
- [A Lightweight Instrument-Agnostic Model for Polyphonic Note Transcription and Multipitch Estimation](https://arxiv.org/abs/2203.09893), Bittner et al., ICASSP 2022 — the network and its three readings.
