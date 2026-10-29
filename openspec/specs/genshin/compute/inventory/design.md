# Inventory

## Queue

## Waiting

- [ ] `[page]` {inventory-screen-whole} needs parity-page — **Inventory: the bag's whole frame.** The two bag references are a backdrop and a region, not two regions (`scripts/src/services/genshinParity/shared/ParityReferenceMap.snapshot.md`): `inventory-food` is a backdrop (`isBackdrop`, which judges only what an overlay adds over the frame it was taken from, `scripts/src/models/genshinParity/shared/ParityReferenceBase.ts` lines 13-15), and `inventory-weapons` is a region (1270 by 1048 at x 650, `scripts/src/services/genshinParity/shared/ParityReferenceMap.ts` line 638). So no whole-screen reference exists. Its whole frame would be read from `{data-root}/genshin-parity/captures/yt-_agTJviXj7s-bag.mp4` at a moment the bag fills the screen, then `pnpm -C scripts genshin:parity compare` and `approve` on it. Writes the screen's image beside its component. Bar: the default, as the screen records no bar ([compute bars](../README.md#bars)). — covers `InventoryScreen`, which renders `packages/genshin-world/src/components/Inventory/Screen/Index.vue`. Its whole-frame moment is cut at 20 seconds into `yt-_agTJviXj7s-bag.mp4` (the Weapons tab, with a webcam over its top left that a mask must clear). Sources searched: `genshin:parity screens` on Inventory (only the Artifact Set Filter, not the bag), and Wikimedia Commons for "Genshin Impact inventory" (no hit). Waits on its 20-second cut of the bag's Weapons tab, which the install does not hold.

## Open

- [ ] **Inventory: the whole-frame moment cut at 20 seconds** — no source yet: the 20-second cut image of the bag's Weapons tab is not on disk in the install. `{data-root}/genshin-parity/references/` holds `inventory-weapons.png`, the region reference above, not a whole frame.
- [ ] **The recording's Weapons tab at 20 seconds has a webcam over its top left** — no source yet: `{data-root}/genshin-parity/captures/yt-_agTJviXj7s-bag.mp4` exists, but no frame of it was opened to see the tab, the moment or the webcam, so the mask it would need is not checked.
