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

## Sources

- `prompt-scroll.mkv` — a pile with more drops than the list has rows, the wheel run from its first row to its last and back, no caption or camera inset over the list, 20 seconds at most. Found 2026-10-11, a near one: https://www.youtube.com/watch?v=UBNImta_dWs at 0–25 s (`captures/yt-UBNImta_dWs-prompt-scroll.mp4`), the English PC client at 1080p and 59.94 frames a second, no caption or inset: a chest's drops, the list scrolled with F's cap to its last row, Hunter's Bow, by 3.5 s and picked up from the bottom, then three Jueyun Chili rows over plain grass at 21–24 s, the pill's right end clear of the scene. It is the 2020 build, and the wheel is not run back up.
