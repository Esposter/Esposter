# Crafting

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {crafting-table} needs parity-page — **Crafting: the table over its whole frame.** `pnpm -C scripts genshin:parity compare crafting-table`, then `pnpm -C scripts genshin:parity approve crafting-table`. Reads `~/Esposter/genshin-parity/references/crafting-table.png` (from `captures/yt-qQILsaJKlsI-crafting-table.mp4` at 39.5 seconds), and the screen's page. Writes the screen's image beside its component once approved, and its row of `ParityReferenceMap.snapshot.md`. Bar: FLIP under 0.05, the global default, as the screen records no bar. — blocked: no plate exists (the clip has no frame of the spot with the screen closed; 37 seconds is the camera still moving, 38 seconds the screen already up), so the entry scores the opaque panels through its `mask` and whole-frame approval waits on a plate. Built in four parts, each lowering the mask score: the header, coins, close and tabs (54.43% to 52.26%), the recipe grid (to 51.79%), the detail panel (to 51.67%), and the materials row, crafter and craft button (to 39.00%, FLIP 0.7678 against the 0.05 bar). Open: the flat tiles and the header glass carry no art, the stepper glyphs and +/- buttons, the tab icons, the preview tile and its ring, the coin marks, the scrollbar, and the words "Character Selection", "Filter / All" and the category "Gadget", which no game-text key holds yet. Approval needs the glass and the item art drawn, a measured art pass the mask cannot stand in for. Covers `CraftingScreen`, which `Crafting/Screen` renders over this same frame. Sources searched for a second still: `genshin:parity screens` on Crafting, Crafting Table, Blacksmith and Forge where no whole screen shows, and Wikimedia Commons for "Genshin Impact crafting", no hit.
