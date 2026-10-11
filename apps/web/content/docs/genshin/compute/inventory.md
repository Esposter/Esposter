---
title: Compute queue: Inventory
description: The inventory's runs: the world's bag given a whole frame, and the interface's inventory screen given a fixture and a reference.
---

# Inventory

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {inventory-screen-whole} needs parity-page — **Inventory: the bag's whole frame.** The two bag references score a region each (`inventory-food`, `inventory-weapons`), so no whole-screen reference exists. Its whole frame would be read from `~/Esposter/genshin-parity/captures/yt-_agTJviXj7s-bag.mp4` at a moment the bag fills the screen, then `pnpm -C scripts genshin:parity compare` and `approve` on it. Writes `packages/genshin-world/src/components/Inventory/Screen/Index.win32.png` once approved. Bar: FLIP under 0.05, the global default, as the screen records no bar. — blocked: no whole-frame moment of the bag is named or cut yet.

- [ ] `[page]` {inventory-screen-interface} needs parity-page — **Inventory screen: a parity-page fixture, then its reference cropped from a wiki still.** Gives `InventoryScreen` an `Index.fixture.ts` beside its `Index.vue` and a `ParityReferenceMap` entry naming a wiki crop of its screen (a wiki still of the bag, none chosen yet), then runs `pnpm -C scripts genshin:parity compare inventory-screen-interface` and `pnpm -C scripts genshin:parity approve inventory-screen-interface`. Writes `packages/genshin-interface/src/components/InventoryScreen/Index.win32.png` once approved. Bar: FLIP under 0.05, the global default, as the screen records no bar. — blocked: no fixture or reference exists yet.
