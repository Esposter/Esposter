---
title: Compute queue: Interaction
description: The interaction pill's right end and the selection's move, read off a clean pickup.
---

# Interaction

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {interaction-pill-right} needs game-exports, media-engine, parity-page — **Interaction: the pill's right end and the selection's move, read off a clean pickup.** `pnpm -C scripts genshin:parity compare interaction-prompts-pickup`, its reference re-cut from `captures/yt-UBNImta_dWs-prompt-scroll.mp4`, the near one found for `prompt-scroll.mkv`, at 22 seconds: three Jueyun Chili rows over plain grass, the third selected, so the pill's right end stands clear of the scene; at 3.5 seconds the list is scrolled to its last row. Reads that clip and writes nothing; its region's mean difference is the bar, 2%. — input missing: the reference re-cut to that frame and a fixture variant with its three rows, the third selected (main session)
- [ ] `[page]` {interaction-prompts-interface} needs parity-page — **Interaction prompts: a parity-page fixture, then its reference cropped from a wiki still.** Gives `InteractionPrompts` an `Index.fixture.ts` beside its `Index.vue` and a `ParityReferenceMap` entry naming a wiki crop of its screen (a wiki still of the prompt, none chosen yet), then runs `pnpm -C scripts genshin:parity compare interaction-prompts-interface` and `pnpm -C scripts genshin:parity approve interaction-prompts-interface`. Writes `packages/genshin-interface/src/components/InteractionPrompts/Index.win32.png` once approved. Bar: FLIP under 0.05, the global default, as the screen records no bar. — blocked: no fixture or reference exists yet.
