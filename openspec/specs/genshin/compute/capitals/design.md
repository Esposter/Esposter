# Capitals

## Queue

## Waiting

- [ ] `[cpu]` {capital-area-outlines} needs game-exports — **Capitals: Nod-Krai's and Snezhnaya's capital areas outlined as the game draws them.** `pnpm -C scripts genshin:text fetch`, then `pnpm -C scripts genshin:assets fit windrise --only catalogue`. Reads the dump's `BinOutput/Scene/WorldArea/scene3_worldArea.json`, the game's own polygon for each area, which outlines every other capital's area already (`fitAreaOutlines`, [world map](../../world-map/design.md)). Writes `packages/genshin-world/src/data/catalogue.json` and the hosted key `catalogue/catalogue`. Bar: Lempo Isle's and Everfrozen Earth's outlines the game's own, in place of the one drawn round Lempo Isle's waypoints' tiles and Everfrozen Earth's provisional square. — waits on the community's dump holding Nod-Krai's and Snezhnaya's area polygons, which its file does not yet
