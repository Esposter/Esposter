---
title: Compute queue: Crafting
description: The crafting table's runs: its whole frame approved, and the interface's crafting screen given a fixture and a reference.
---

# Crafting

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {crafting-table} needs parity-page — **Crafting: the table over its whole frame.** `pnpm -C scripts genshin:parity compare crafting-table`, then `pnpm -C scripts genshin:parity approve crafting-table`. Reads `~/Esposter/genshin-parity/references/crafting-table.png` (from `captures/yt-qQILsaJKlsI-crafting-table.mp4` at 39.5 seconds), and the screen's page. Writes the screen's image beside its component once approved, and its row of `ParityReferenceMap.snapshot.md`. Bar: FLIP under 0.05, the global default, as the screen records no bar. — blocked: the fixture's state now matches the clip (Consumable tab, Condensed Resin, Diluc, Crafting Performed 1, Required 100), and the score is still mean 60.90%, FLIP 0.9300. The next round needs the interface's layout built: `CraftingScreen` (`packages/genshin-interface`) is a placeholder with one scoped rule, so its place, size, colour and tab, recipe and material rows are measured from the clip's frame, and the reference's scope decided, since the entry names no `region` or `plate` and the clip's glass and art are not drawn. Covers `CraftingScreen`, which `Crafting/Screen` renders over this same frame. Sources searched for a second still: `genshin:parity screens` on Crafting, Crafting Table, Blacksmith and Forge where no whole screen shows, and Wikimedia Commons for "Genshin Impact crafting", no hit.
