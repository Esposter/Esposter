# Inventory

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {inventory-screen-whole} needs parity-page — **Inventory: the bag's whole frame.** The two bag references score a region each (`inventory-food`, `inventory-weapons`) `scripts/src/services/genshinParity/shared/ParityReferenceMap.snapshot.md`, so no whole-screen reference exists. Its whole frame would be read from `~/Esposter/genshin-parity/captures/yt-_agTJviXj7s-bag.mp4` at a moment the bag fills the screen, then `pnpm -C scripts genshin:parity compare` and `approve` on it. Writes the screen's image beside its component once approved. Bar: FLIP under 0.05, the global default, as the screen records no bar. — covers `InventoryScreen`, which renders `packages/genshin-world/src/components/Inventory/Screen/Index.vue`. Its whole-frame moment is cut at 20 seconds into `yt-_agTJviXj7s-bag.mp4` (the Weapons tab, with a webcam over its top left that a mask must clear). Sources searched: `genshin:parity screens` on Inventory (only the Artifact Set Filter, not the bag), and Wikimedia Commons for "Genshin Impact inventory" (no hit).

## Open

- [ ] **Inventory: the whole-frame moment cut at 20 seconds** — no source yet: the 20-second cut image of the bag's Weapons tab is not on disk in the install.
