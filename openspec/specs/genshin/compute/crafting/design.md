# Crafting

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {crafting-table} needs parity-page — **Crafting: the table over its whole frame.** `pnpm -C scripts genshin:parity compare crafting-table`, then `pnpm -C scripts genshin:parity approve crafting-table`. Reads the crafting-table plate (from the clip at 39.5 seconds), and the screen's page. Writes the screen's image beside its component once approved, and its row of `scripts/src/services/genshinParity/shared/ParityReferenceMap.snapshot.md`. Bar: FLIP under 0.05, the global default, as the screen records no bar. — blocked: no plate exists (the clip has no frame of the spot with the screen closed; 37 seconds is the camera still moving, 38 seconds the screen already up), so the entry scores the opaque panels through its `mask` and whole-frame approval waits on a plate. Built in four parts `packages/genshin-interface/src/components/CraftingScreen/Index.vue`, each lowering the mask score: the header, coins, close and tabs (54.43% to 52.26%), the recipe grid (to 51.79%), the detail panel (to 51.67%), and the materials row, crafter and craft button (to 39.00%, FLIP 0.7678 against the 0.05 bar) `scripts/src/services/genshinParity/shared/ParityReferenceMap.snapshot.md`. Open: the flat tiles and the header glass carry no art, the stepper glyphs and +/- buttons, the tab icons, the preview tile and its ring, the coin marks, the scrollbar, and the words "Character Selection", "Filter / All" and the category "Gadget", which no game-text key holds yet. Approval needs the glass and the item art drawn, a measured art pass the mask cannot stand in for. Covers `CraftingScreen`, which Crafting/Screen renders over this same frame `packages/genshin-world/src/components/Crafting/Screen/Index.vue`. Sources searched for a second still: `genshin:parity screens` on Crafting, Crafting Table, Blacksmith and Forge where no whole screen shows, and Wikimedia Commons for "Genshin Impact crafting", no hit.

## Open

- [ ] **Crafting: the mask scores of the first three parts, 54.43% to 52.26%, then 51.79% and 51.67%** — no source yet: a recorded parity run of each part's mask, which the snapshot keeps only for the final 39.00%.
- [ ] **The compare reads the crafting-table plate** — no source yet: the crafting-table plate crafting-table.png is not in genshin-parity's references.
- [ ] **The plate is the clip's frame at 39.5 seconds, and the clip has no frame of the spot with the screen closed (37 seconds the camera still moving, 38 seconds the screen up)** — no source yet: the clip yt-qQILsaJKlsI-crafting-table.mp4 is not in genshin-parity's captures.
