# Tasks

The pipeline's tests run under Node with fake ONNX Runtime sessions and synthetic tensors: no model file is committed, and CI has no GPU. The real run, a prompt becoming an image on a GPU, is task 4.3's driven-browser check on the owner's machine.

## 1. The pipeline package

- [ ] 1.1 Create the `image-diffusion` package from the shared package configuration, with its row in the `AGENTS.md` package table, and read a safetensors file's header and tensors from bytes. Verify: the package's README example compiles, and the reader's tests run under `pnpm test` in the package.
- [ ] 1.2 Write the flow-matching sampler, the seeded noise and `generateImage` over the text encoder, denoiser and decoder sessions, with progress and a cancel check between steps. Verify: tests named after the scenarios 'A prompt becomes an image' and 'Cancelling stops the generation before its next step' written first and seen failing.
- [ ] 1.3 Write the PNG parameters chunk. Verify: a test named after the scenario 'A saved image carries its settings' written first and seen failing.

## 2. LoRAs

- [ ] 2.1 Map kohya and `diffusion_model.` keys to slot names, list the keys that map to nothing, and refuse a file whose keys all fail to map. Verify: tests named after the scenarios 'A LoRA fills the model's slots at its strength', 'A text-encoder LoRA's keys are reported as skipped' and 'A LoRA for another model is refused' written first and seen failing.
- [ ] 2.2 Combine several LoRAs by scaled sum and truncated SVD to the slot's rank. Verify: tests named after the scenarios 'Two LoRAs apply together' and 'A combination over the slot's rank keeps its largest components' written first and seen failing.

## 3. The weights

- [ ] 3.1 Add the conversion command in `scripts`, building LoRA slots into Z-Image Turbo's denoiser after anima-webgpu's MIT export, quantizing the denoiser and the text encoder to int4 and int8, and measuring each denoiser call against the PyTorch reference on fixed prompts and seeds. Verify: the command's report lists both builds' sizes and per-call relative differences, and selects the smaller build under 3%.
- [ ] 3.2 Publish the selected Z-Image Turbo build, with its Apache-2.0 licence and notice, under the `image-studio` hosted-assets scope. Verify: the committed lock names every graph and weight file, and hosted assets' read-back check passes for each one.

## 4. The page

- [ ] 4.1 Add the route, its Labs group entry and the worker holding the sessions, and time ONNX Runtime Web's two WebGPU builds on the owner's GPU, keeping the faster. Verify: tests named after the scenarios 'A browser without WebGPU sees the unsupported notice', 'A second visit loads the model without downloading it', 'Generating sends no request' and 'A lost GPU device fails the generation with a message' written first and seen failing, and the two builds' step times recorded in the commit body.
- [ ] 4.2 Build the model card, the download confirmation dialog with its space check and time estimate, and the progress bar with Cancel, over hosted assets' preload, which gains an abort signal. Verify: tests named after the scenarios 'Opening the page downloads no model', 'The confirmation dialog states the download's cost', 'Dismissing the confirmation downloads nothing', 'A device without room for the model cannot confirm', 'A download shows its progress', 'Cancelling a download stops it' and 'An interrupted download fetches only the files it is missing' written first and seen failing.
- [ ] 4.3 Build the prompt form, the LoRA panel and the image result with saving. Verify: a test named after the scenario 'Adding a LoRA sends no request' written first and seen failing, and a driven-browser run on the owner's GPU where a confirmed download, a prompt, a prompt with a LoRA, a cancelled generation and a second visit each behave as specified, with the image times recorded in the commit body.
