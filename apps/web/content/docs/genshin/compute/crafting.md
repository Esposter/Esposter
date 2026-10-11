---
title: Compute queue: Crafting
description: The crafting table's runs: its whole frame approved, and the interface's crafting screen given a fixture and a reference.
---

# Crafting

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {crafting-table} needs parity-page — **Crafting: the table over its whole frame.** `pnpm -C scripts genshin:parity compare crafting-table`, then `pnpm -C scripts genshin:parity approve crafting-table`. Reads `~/Esposter/genshin-parity/references/crafting-table.png` (from `captures/yt-qQILsaJKlsI-crafting-table.mp4` at 39.5 seconds), and the screen's page. Writes `packages/genshin-world/src/components/Crafting/Screen/Index.win32.png` once approved, and its row of `ParityReferenceMap.snapshot.md`. Bar: FLIP under 0.05, the global default, as the screen records no bar. — blocked: the screen's build scores over the bar, FLIP 0.9300 in `ParityReferenceMap.snapshot.md`, so its build is the input that changes.

- [ ] `[page]` {crafting-screen-interface} needs parity-page — **Crafting screen: a parity-page fixture, then its reference cropped from a wiki still.** Gives `CraftingScreen` an `Index.fixture.ts` beside its `Index.vue` and a `ParityReferenceMap` entry naming a wiki crop of its screen (a wiki still of the crafting screen, none chosen yet), then runs `pnpm -C scripts genshin:parity compare crafting-screen-interface` and `pnpm -C scripts genshin:parity approve crafting-screen-interface`. Writes `packages/genshin-interface/src/components/CraftingScreen/Index.win32.png` once approved. Bar: FLIP under 0.05, the global default, as the screen records no bar. — blocked: no fixture or reference exists yet.
