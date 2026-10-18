# Inventory

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {inventory-screen-whole} needs parity-page — **Inventory: the bag's whole frame.** The two bag references score a region each (`inventory-food`, `inventory-weapons`), so no whole-screen reference exists. Its whole frame would be read from `~/Esposter/genshin-parity/captures/yt-_agTJviXj7s-bag.mp4` at a moment the bag fills the screen, then `pnpm -C scripts genshin:parity compare` and `approve` on it. Writes the screen's image beside its component once approved. Bar: FLIP under 0.05, the global default, as the screen records no bar. — blocked: no whole-frame moment of the bag is named or cut yet. Covers `InventoryScreen`, which `Inventory/Screen` renders. A whole-frame moment is now cut: 20 seconds into `yt-_agTJviXj7s-bag.mp4` (`references/yt-_agTJviXj7s-bag/20s.png`, the Weapons tab, with a webcam over its top left that a mask must clear). Sources searched: `genshin:parity screens` on Inventory (only the Artifact Set Filter, not the bag), and Wikimedia Commons for "Genshin Impact inventory" (no hit).
