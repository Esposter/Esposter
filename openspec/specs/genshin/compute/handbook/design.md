# Handbook

## Queue

Nothing here.

## Waiting

- [ ] `[page]` {handbook-experience} needs parity-page — **Handbook: the experience page over its whole frame.** `pnpm -C scripts genshin:parity compare handbook-experience`, then `pnpm -C scripts genshin:parity approve handbook-experience`. Reads `~/Esposter/genshin-parity/references/handbook-experience.png` (the wiki's `File:Adventurer Handbook Experience.png`), and the screen's page. Writes the screen's image beside its component once approved, and its row of `ParityReferenceMap.snapshot.md`. Bar: FLIP under 0.05, the global default, as the screen records no bar. — its rounds built the Experience page `packages/genshin-world/src/components/Handbook/Screen/Index.vue` (the investigation panel, the chapter navigator and five commission rows `packages/genshin-world/src/components/Handbook/Screen/Index.fixture.ts`, measured at 1080 high, the words by text id), then measured it (the rows as 242 high cards `packages/genshin-world/src/components/Handbook/Screen/Index.vue` at a 249.5 pitch, the titles centred and letter-spaced to the game's widths, the reward tiles in their rarity's colours through the interface's `ItemTile`, the tabs, panel, chapter checks, arrows and close banner in the frame's sizes and colours). It is still over the bar, and held there by the art that cannot ship and Signika standing in for HYWenHei `packages/genshin-world/src/components/Handbook/Screen/Index.vue`, both listed on the [handbook](../../adventurer-handbook/design.md) page. What a next round can still draw: the current chapter's ornate ring, and the open tab's look (17 further out with a green edge), which waits on the interaction states.

## Open

- [ ] **Handbook: the Experience page's commission rows at a 249.5 pitch** — no source yet: a layout constant or measured pitch for the rows; the component names only the 242 high card.
- [ ] **The Experience page is still over the FLIP bar** — no source yet: the parity snapshot's row holds only the whole page's FLIP, 0.2456, and no part of the page is scored.
- [ ] **The titles, reward tiles, tabs and chapter checks match the frame's widths, colours and sizes** — no source yet: no part of the page is scored in the parity snapshot, so each measure is unchecked against the frame.
