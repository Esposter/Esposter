# Pitch transcription on ONNX Runtime

## Why

`pitch-transcription` runs Basic Pitch's network on TensorFlow.js.

- **The engine has stopped.** TensorFlow.js has had no release since 4.22.0 in October 2024, and its repository takes only maintenance commits.
- **It is slow under Node.** There it runs the network on a pure JavaScript CPU backend, two orders of magnitude slower than a native runtime, and the Genshin music fits are the package's one consumer.
- **It is the heaviest dependency tree in the workspace, and nearly all of it is unused.** The umbrella package installs the layers API, the data API, the WebGL backend, `core-js`, `regenerator-runtime`, `yargs` and `argparse`; the one network uses none of them. One of those packages, `argparse`, is why `osv-scanner.toml` carries the `sprintf-js` exception.

Basic Pitch's model repository publishes the same network as ONNX. ONNX Runtime is already installed in `scripts`, the package's consumer, because Transformers.js runs on it. So the network can move to ONNX Runtime without adding a dependency.

## What Changes

- The package ships the model repository's `nmp.onnx`, unmodified, in place of the TensorFlow.js export.
- Its peer dependency becomes `onnxruntime-common`, the API that both ONNX Runtime packages implement. The consumer creates the inference session with `onnxruntime-node` under Node or `onnxruntime-web` in a browser, and chooses its execution provider.
- The recording's windows become views over one padded buffer, and each window's readings are trimmed by index arithmetic. Neither step needs a tensor library any more.
- The Genshin music fit reads its sources through `onnxruntime-node`.
- TensorFlow.js leaves the catalog, both manifests and the ledger. The `core-js` build allowance and the `sprintf-js` OSV exception go with it.
- The package's README is rewritten as built, and its Upstream table is judged again for the rows TensorFlow.js owned.

## Capabilities

None. The package's area holds its README, which is rewritten as built.

## Waiting on

None.

## Impact

- `packages/pitch-transcription`: `model/`, `src/constants.ts`, `src/services/readModel.ts`, `src/services/prepareAudioWindows.ts`, `src/services/unwrapWindowReadings.ts`, their tests, the manifest and `NOTICE`.
- `scripts/src/services/genshinAssets/shared/readMusicSourceNotes.ts` and `scripts/package.json`.
- `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `osv-scanner.toml` and `.agents/ledgers/dependencies.md`.
