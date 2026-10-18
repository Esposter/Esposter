## 1. The runtime

- [x] 1.1 While TensorFlow.js is still installed, write the test 'hears the notes the TensorFlow.js export heard' in `readModel.test.ts`. It reads a fixed two-tone recording through the current model, and its expected notes are an inline snapshot captured from that run. Verify: `pnpm test src/services/readModel.test.ts --run` from `packages/pitch-transcription` passes on TensorFlow.js.
- [x] 1.2 Ship `nmp.onnx` in `model/` in place of `model.json` and its shard, and name its output tensors in `constants.ts`. Rewrite `readModel`, `prepareAudioWindows` and `unwrapWindowReadings` over an inference session and plain typed arrays. The test 'frees every tensor it makes' becomes 'disposes every output it reads', and the test #19 fails on any `onnxruntime` specifier in the notes subpath's graph. Verify: the same command passes with the snapshot of task 1.1 unchanged, and `pnpm test src/index.test.ts --run` passes.
- [ ] 1.3 Create the Genshin music fit's session in `readMusicSourceNotes` from `onnxruntime-node`. Verify: `pnpm test src/services/genshinAssets --run` from `scripts` passes.

## 2. The removal

- [ ] 2.1 Remove `@tensorflow/tfjs` from the catalog, both manifests and the ledger, and add `onnxruntime-node` and `onnxruntime-common` at the versions Transformers.js already resolves. Drop the `core-js` build allowance and the `sprintf-js` exception in `osv-scanner.toml`, then run `pnpm i`. Verify: `@tensorflow` appears nowhere in `pnpm-lock.yaml`, and task 1.3's suite still passes, since a session fed a tensor from a second copy of `onnxruntime-common` refuses it.
- [ ] 2.2 Rewrite the package's README as built, and update the pitch-transcription paragraph of the dependency admission page. Verify: `pnpm -C scripts exec vitest run src/workspace/citations.test.ts src/workspace/openspecLinks.test.ts src/workspace/staleNames.test.ts src/services/openspec` passes.
