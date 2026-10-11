---
title: Compute queue: Crafting
description: The crafting table's runs: its whole frame approved, and the interface's crafting screen given a fixture and a reference.
---

# Crafting

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {crafting-table} needs parity-page — **Crafting: the table over its whole frame.** `pnpm -C scripts genshin:parity compare crafting-table`, then `pnpm -C scripts genshin:parity approve crafting-table`. Reads `~/Esposter/genshin-parity/references/crafting-table.png` (from `captures/yt-qQILsaJKlsI-crafting-table.mp4` at 39.5 seconds), and the screen's page. Writes `packages/genshin-world/src/components/Crafting/Screen/Index.win32.png` once approved, and its row of `ParityReferenceMap.snapshot.md`. Bar: FLIP under 0.05, the global default, as the screen records no bar. — blocked: the screen's build scores over the bar, FLIP 0.9300 in `ParityReferenceMap.snapshot.md`, so its build is the input that changes. Covers `CraftingScreen`, which `Crafting/Screen` renders over this same frame. Sources searched for a second still: `genshin:parity screens` on Crafting, Crafting Table, Blacksmith and Forge (no whole-screen image), and Wikimedia Commons for "Genshin Impact crafting" (no hit).
