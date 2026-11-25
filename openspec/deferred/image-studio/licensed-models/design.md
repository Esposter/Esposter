# Licensed models

Anima and Qwen-Image 2.1 as further models in Image Studio, beside Z-Image Turbo. Anima is an anime model of about two billion parameters whose runtime LoRA path is already proven in a browser by anima-webgpu, at about twelve seconds per 1024×1024 image on a 16 GB card. Qwen-Image 2.1 has a seven-billion-parameter visual transformer and an int4 browser build of 7.4 GB.

## Why deferred

Neither licence allows a public page. Anima's CircleStone Non-Commercial Licence says use in direct interaction with, or with an impact on, third-party end users is not a non-commercial purpose, whether or not anyone pays (section 1(c)), and it counts making the weights available on a hosted basis as distribution (section 1(b)). Images made with it may be used commercially (section 2(e)), but the page itself is the use the licence excludes. Qwen-Image 2.1's Qwen Research Licence allows use for research or evaluation purposes only (section 1(i)) and asks for a separate licence for any other use (section 9(a)).

**Revisit when:** CircleStone Labs or Alibaba's Qwen team grants a licence for a free public page, or either model's licence changes to allow one. The slot export, the download dialog and the pipeline are the model's own data, so either model is a conversion and a catalogue entry once its licence allows.

## Sources

- [Anima's licence](https://huggingface.co/circlestone-labs/Anima/blob/main/LICENSE.md) — the CircleStone Labs Non-Commercial Licence, sections 1(b), 1(c), 2(b) and 2(e).
- [Qwen-Image 2.1's licence](https://github.com/QwenLM/Qwen-Image-2.1/blob/main/LICENSE) — the Qwen Research Licence Agreement, sections 1(i), 2(b) and 9(a).
- [anima-webgpu](https://github.com/joykst96/anima-webgpu) — Anima's browser build and its runtime LoRA slots.
- [Qwen-Image 2.1 WebGPU](https://huggingface.co/linoyts/Qwen-Image-2.1-WebGPU) — Qwen-Image 2.1's int4 browser build.
