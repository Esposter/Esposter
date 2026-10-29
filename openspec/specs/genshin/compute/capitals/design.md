# Capitals

## Queue

## Waiting

- [ ] `[cpu]` {capital-area-outlines} needs game-exports — **Capitals: Nod-Krai's and Snezhnaya's capital areas outlined as the game draws them.** `pnpm -C scripts genshin:text fetch`, then `pnpm -C scripts genshin:assets fit windrise --only catalogue`. Reads the dump's `BinOutput/Scene/WorldArea/scene3_worldArea.json`, the game's own polygon for each area, which outlines every other capital's area already (`fitAreaOutlines`, [world map](../../world-map/design.md)). Writes `packages/genshin-world/src/data/catalogue.json` and the hosted key `catalogue/catalogue`. Bar: Lempo Isle's and Everfrozen Earth's outlines the game's own, in place of the one drawn round Lempo Isle's waypoints' tiles and Everfrozen Earth's provisional square. — waits on the community repository's `main` holding polygons for Nod-Krai's and Snezhnaya's areas. The dump's `scene3_worldArea.json` is `main`'s blob and holds 49 level-one polygons and 309 level-two, none for the twelve areas of the two regions the table gives an id (55 to 59, 70 to 76) nor for their 42 subarea rows, and none of the other world-area files on `main` holds one. The item returns to the queue when a `genshin:text fetch` finds them.

## Sources

- the community dump, `BinOutput/Scene/WorldArea/scene3_worldArea.json`, holding the game's own polygon for each area: the availability the outline waits on (grounds Requirement: The capital areas of Nod-Krai and Snezhnaya).
