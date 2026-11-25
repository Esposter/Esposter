# Image Studio

## Why

Open image models now run in a browser. Anima, an anime model of about two billion parameters, generates a 1024×1024 image in about twelve seconds on a 16 GB consumer card through ONNX Runtime Web on WebGPU, and the anima-webgpu project shows the user's own LoRA files applied at run time without re-exporting the model. Qwen-Image 2.1 has a browser build as well, at a larger size. Esposter has no way to make an image today. A page where the whole pipeline runs on the visitor's own graphics card costs no server, keeps every prompt and every LoRA on the device, and fits the product list as one route.

## What changes

A new route, Image Studio, listed in the product list's Labs group, beside the other demos:

- **Models.** The page checks for WebGPU and the free storage space before offering anything. Nothing downloads when the page opens. The user asks for a model, and a confirmation dialog shows its download size, the space it takes, an estimate of how long the download takes and the model's licence. The download starts only once the user confirms it. A progress bar then shows the bytes held and the time left, and the user can cancel it. A model downloaded once loads from the device on every later visit, and an interrupted download resumes from the files it already holds.
- **Generation.** A prompt, a seed, a size and a step count become an image on the device, step by step with progress, and the user can cancel a generation between steps. An image is saved as a PNG carrying its prompt, seed, model and LoRAs.
- **LoRAs.** The user adds `.safetensors` LoRA files, each at its own strength, and they apply to the next image. A LoRA's keys the model cannot take are listed rather than dropped silently, and a LoRA made for another model is refused.
- **A pipeline package.** A new workspace package, `image-diffusion`, holds the text encoder, the denoising loop, the decoder and the LoRA reading over an ONNX Runtime session the consumer brings.
- **Converted weights.** A command in `scripts` exports Anima with empty LoRA slots, quantizes it, splits it into files and publishes them through hosted assets.
- **A large model.** Qwen-Image 2.1 is offered as a second, larger model on devices whose GPU can hold it.

## Not in this change

- **A server fallback.** A browser without WebGPU is told the page needs it. No image is generated on a server, so nothing the user types ever leaves the device.
- **A gallery kept across visits.** Images live for the session and are kept by saving them. A gallery stored on the device is its own change.
- **Image editing, inpainting and image-to-image.** This change only turns a prompt into an image.
- **Anima's Base preset.** It takes about thirty steps with guidance, against Turbo's eight. The first build ships Turbo alone.
- **Commercial use of the page.** Both models' weights are licensed for non-commercial use only. The page is free and states the licence. Putting it behind payment would need a model licensed for commercial use, which Z-Image Turbo is (see the design's Decisions).

## Capabilities

### New capabilities

- `image-studio/models`: the device check, the confirmed download, its progress and cancellation, and the cache.
- `image-studio/generation`: a prompt to an image on the device, with progress, cancellation and the saved image's settings.
- `image-studio/lora`: the user's LoRA files, read, combined and applied on the device.

### Modified capabilities

None.

## Impact

One new route, one new workspace package, one new `scripts` command and a hosted-assets scope holding the converted weights. No procedure, table or Worker changes. `onnxruntime-web` joins the catalog beside `onnxruntime-common` and `onnxruntime-node`.
