# Tasks

A slice is one session. Before taking one, run `pnpm ai:resume` and read the proposal and the design here, then the first change's design for the pattern; after it, the finishing ritual in `AGENTS.md`. The design's "Per slice" list is the order of work inside a slice.

## 1. The slices

- [x] 1.1 The quests as a feature store, first since the adventure rank, the commissions, the archive and the restorative power read the main quests it finishes. Verify: the store's test; the eleven readers no longer take its results; the count script's keys fall; the package's typecheck and the touched tests pass; the slice's count is recorded here. Done: `src/store/quests.ts`; the script prints `47 364 0` from `48 388 0`, the root is 1,892 lines from 1,918; the slice is 211 lines added and 165 removed over 21 files, +46, and 51 fewer once its two new test files (97 lines) are left out (the quests had no test before). The Quest page was not cut: the screen takes eight props that are the store's own and the page would only forward them, which the splitting guide says is not a cut.
- [ ] 1.2 The adventure rank as a feature store, reading the quests store. Verify: as 1.1, and the offerings, the quest rewards and the commissions no longer take `gainWorldAdventureExp`.
- [ ] 1.3 The map as a feature store. Verify: as 1.1, and the minimap and the map screen read the same markers.
- [ ] 1.4 The pickups as a feature store. Verify: as 1.1, and a drop placed by an offering, a chest and an outcrop reaches the same pickup list.
- [ ] 1.5 The puzzles as a feature store. Verify: as 1.1, and the puzzle chests are the ones the chest composable read before.
- [ ] 1.6 The combat's low-frequency state as a feature store, once the frame step's baseline (the first change's task 0.2) is recorded. Verify: as 1.1, and the frame step does not slow by more than the baseline's noise.

## 2. The gate

- [ ] 2.1 Total the slices against the first change's investigation numbers and state the pattern's final shape in the guides. Verify: the count script's keys, the root's line count and the package's net lines are recorded in the design, and `openspec validate` passes.
