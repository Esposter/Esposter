---
title: Compute queue: Interface
description: The game's 2D interface components with no parity-page screen yet: each given a fixture and a reference, then approved.
---

# Interface

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {forge-screen-interface} needs parity-page — **Forge screen: a parity-page fixture, then its reference cropped from a wiki still.** Gives `ForgeScreen` an `Index.fixture.ts` beside its `Index.vue` and a `ParityReferenceMap` entry naming a wiki crop of its screen (a wiki still of the forge, none chosen yet), then runs `pnpm -C scripts genshin:parity compare forge-screen-interface` and `pnpm -C scripts genshin:parity approve forge-screen-interface`. Writes `packages/genshin-interface/src/components/ForgeScreen/Index.win32.png` once approved. Bar: FLIP under 0.05, the global default, as the screen records no bar. — blocked: no fixture or reference exists yet.

- [ ] `[page]` {two-column-screen-interface} needs parity-page — **Two-column screen: a parity-page fixture, then its reference cropped from a wiki still.** Gives `TwoColumnScreen` an `Index.fixture.ts` beside its `Index.vue` and a `ParityReferenceMap` entry naming a wiki crop of its screen (a wiki still of any two-column screen, none chosen yet), then runs `pnpm -C scripts genshin:parity compare two-column-screen-interface` and `pnpm -C scripts genshin:parity approve two-column-screen-interface`. Writes `packages/genshin-interface/src/components/TwoColumnScreen/Index.win32.png` once approved. Bar: FLIP under 0.05, the global default, as the screen records no bar. — blocked: no fixture or reference exists yet.
