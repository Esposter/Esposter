# Tasks

A slice is one session. Before taking one, run `pnpm ai:resume` and read the proposal and the design here, then the first change's design for the pattern; after it, the finishing ritual in `AGENTS.md`. The design's "Per slice" list is the order of work inside a slice.

## 1. The slices

- [ ] 1.1 The adventure rank as a feature store. Verify: the store's test written first and seen failing; the offerings, the quest rewards and the commissions no longer take `gainWorldAdventureExp`; the count script's keys fall; the package's typecheck and the touched tests pass; the slice's count is recorded here.
- [ ] 1.2 The quests as a feature store, with the Quest page mounted on it. Verify: as 1.1, and the save written after a quest step holds the same quest state.
- [ ] 1.3 The map as a feature store. Verify: as 1.1, and the minimap and the map screen read the same markers.
- [ ] 1.4 The pickups as a feature store. Verify: as 1.1, and a drop placed by an offering, a chest and an outcrop reaches the same pickup list.
- [ ] 1.5 The puzzles as a feature store. Verify: as 1.1, and the puzzle chests are the ones the chest composable read before.
- [ ] 1.6 The combat's low-frequency state as a feature store, once the frame step's baseline (the first change's task 0.2) is recorded. Verify: as 1.1, and the frame step does not slow by more than the baseline's noise.

## 2. The gate

- [ ] 2.1 Total the slices against the first change's investigation numbers and state the pattern's final shape in the guides. Verify: the count script's keys, the root's line count and the package's net lines are recorded in the design, and `openspec validate` passes.
