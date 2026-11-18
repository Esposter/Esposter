## 1. Drops, bag and wallet

- [x] 1.1 Pour weapons, artifacts and materials out as drops, or send them to the bag where a drop would fall away. Verify: tests named after the scenarios 'an opened chest pours its drops out on open ground' and 'an opened chest sends its drops to the bag where a drop would fall away', seen failing first.
- [x] 1.2 Add Adventure EXP and Sigils to the wallet on opening. Verify: a test named after the scenario 'opening a chest adds its Adventure EXP and Sigils to the wallet', seen failing first.

## 2. Other tiers

- [x] 2.1 Decide the Luxurious chest's Mora and the Remarkable chest's blueprints: options are measuring them from a recording, or keeping both chests unopened until the wiki states them; decides nothing here. Verify: the choice is written into the design before either chest is rewarded.

## 3. Locks by camps

- [x] 3.1 Lock each chest by the enemy camp whose reach it stands in, opening it once the camp is cleared. Verify: tests named after the scenarios 'a chest stays locked while a camp within its reach stands' and 'a chest opens once the camp within its reach is cleared', seen failing first. Built over the provisional twenty-metre reach `CHEST_LOCK_REACH`, which waits on `chest-camp-lock.mkv`.

## 4. Digging and seals

- [x] 4.1 Offer Dig at each buried place and reveal the chest once dug, paying no reward until the tier is measured. Verify: tests named after the scenarios 'a buried chest offers Dig at its place', 'a dug chest appears once dug' and 'a dug chest pays no reward until its tier is measured', seen failing first.
- [ ] 4.2 Free each sealed chest by Pyro for vines or ice, and by a blunt or poise-damaging attack for rock. Verify: tests named after the scenarios 'a chest sealed in vines is freed by Pyro', 'a chest sealed in rock is freed by a blunt attack' and 'a chest sealed in vines is not freed by an attack of another element', seen failing first. The rule is built as `checkIsSealFreed`, and its tests stand in `checkIsSealFreed.test.ts`; the row stays unticked until a sealed chest carries its seal and a strike reaches it.
  - Waits on the seal of each sealed place, which no published place names and no recording measures yet: `chest-seal-pyro.mkv` is in the captures, but its frames at 9, 15, 21 and 27 seconds show Sumeru gameplay and no sealed chest, and with no seal on a place no strike is wired to free one.

## 5. Locks by puzzles

- [x] 5.1 Lock each chest by the puzzle within its reach, once puzzles stand. Verify: a test named after the scenario 'a chest stays locked while a puzzle within its reach is unsolved', seen failing first. Built over the same provisional reach, with the time trials' solved state as the puzzles' done state.

## 6. Achievements and exploration

- [x] 6.1 Count each opened chest once, through its own opened record with no join to the game's chest records, toward its area's exploration and its region's chest achievements. Verify: a test named after the scenario 'an opened chest counts once toward its area's exploration', seen failing first. The scenario 'reopening a chest adds nothing to the count' is pinned by that test's second opening: the recorded ids are a set, so a reopened chest's id is one member however often it is opened. The test was proven failing with its opening's record reverted (`expected [ +0 ] to strictly equal [ 10 ]`), since the count was built before the test. Built: the exploration count is `placeExplorationDoings` with the done ids of `computeExploredDoingIds`, which already counts an opened chest once. The unwired `computeOpenedChestCountMap` twin was removed, since it would have counted each chest a second time. The chest achievement's match is region-only and provisional (`TRIGGER_OPEN_WORLD_CHEST`, `targetIsRegionOnly`), and it does not move in play until its region numbers are mapped, as [chests](../../specs/genshin/chests/design.md) gives.

## 7. One copy of the regions' chests

- [x] 7.1 Hold each region's chest records once. `useWorldChestsStore` keeps a flattened `regionChestPlaces` that the Session's watch refreshes from `Windrise`'s `regionChestMap`, so each region's arrival updates two places. Decide the owner: either the store holds the map `useRegionData` fills, and `regionChestPlaces` becomes a computed over it, or the session hands the map in once and the store derives the list from it. Then drop the watch and the mirrored ref. Verify: a test that the store offers a region's chests from the one record the session hands in, seen failing first, and the store's tests in `chests.test.ts` move to the chosen owner. The choice changes the store's contract the [chests](../../specs/genshin/chests/design.md) design states (the session hands the chests in), so it is decided in that design before it is built.
