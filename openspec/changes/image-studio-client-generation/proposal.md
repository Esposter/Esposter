# Image Studio

## Why

Open image models now run in a browser. Z-Image Turbo, a six-billion-parameter model from Alibaba's Tongyi lab released under Apache-2.0, makes a 1024×1024 image in eight steps, and community ports already run it through ONNX Runtime Web on WebGPU. The anima-webgpu project shows how a user's own LoRA files are applied at run time without re-exporting a model, through empty low-rank slots exported with it, and its code is MIT. Esposter has no way to make an image today. A page where the whole pipeline runs on the visitor's own graphics card costs no server, keeps every prompt and every LoRA on the device, and fits the product list as one route.

## What changes

A new route, Image Studio, listed in the product list's Labs group, beside the other demos:

- **Models.** The page checks for WebGPU and the free storage space before offering anything. Nothing downloads when the page opens. The user asks for a model, and a confirmation dialog shows its download size, the space it takes, an estimate of how long the download takes and the model's licence. The download starts only once the user confirms it. A progress bar then shows the bytes held and the time left, and the user can cancel it. A model downloaded once loads from the device on every later visit, and an interrupted download resumes from the files it already holds.
- **Generation.** A prompt, a seed, a size and a step count become an image on the device, step by step with progress, and the user can cancel a generation between steps. An image is saved as a PNG carrying its prompt, seed, model and LoRAs.
- **LoRAs.** The user adds `.safetensors` LoRA files, each at its own strength, and they apply to the next image. A LoRA's keys the model cannot take are listed rather than dropped silently, and a LoRA made for another model is refused.
- **A pipeline package.** A new workspace package, `image-diffusion`, holds the text encoder, the denoising loop, the decoder and the LoRA reading over an ONNX Runtime session the consumer brings.
- **Converted weights.** A command in `scripts` exports Z-Image Turbo with empty LoRA slots, quantizes it, splits it into files and publishes them through hosted assets.

## Not in this change

- **A server fallback.** A browser without WebGPU is told the page needs it. No image is generated on a server, so nothing the user types ever leaves the device.
- **A gallery kept across visits.** Images live for the session and are kept by saving them. A gallery stored on the device is its own change.
- **Image editing, inpainting and image-to-image.** This change only turns a prompt into an image.
- **Other models.** Anima and Qwen-Image 2.1 are faster or larger, but their licences do not allow a public page, so they are a deferred idea waiting on a licence from their makers.
- **A paid tier.** Z-Image Turbo's Apache-2.0 licence allows commercial use, so nothing about the model stands in the way of one, but the page is free.

## Capabilities

### New capabilities

- `image-studio/models`: the device check, the confirmed download, its progress and cancellation, and the cache.
- `image-studio/generation`: a prompt to an image on the device, with progress, cancellation and the saved image's settings.
- `image-studio/lora`: the user's LoRA files, read, combined and applied on the device.

### Modified capabilities

None.

## Impact

One new route, one new workspace package, one new `scripts` command and a hosted-assets scope holding the converted weights. No procedure, table or Worker changes. `onnxruntime-web` joins the catalog beside `onnxruntime-common` and `onnxruntime-node`.
