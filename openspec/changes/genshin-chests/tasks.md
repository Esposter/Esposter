## 1. Drops, bag and wallet

- [x] 1.1 Pour weapons, artifacts and materials out as drops, or send them to the bag where a drop would fall away. Verify: tests named after the scenarios 'an opened chest pours its drops out on open ground' and 'an opened chest sends its drops to the bag where a drop would fall away', seen failing first.
- [x] 1.2 Add Adventure EXP and Sigils to the wallet on opening. Verify: a test named after the scenario 'opening a chest adds its Adventure EXP and Sigils to the wallet', seen failing first.

## 2. Other tiers

- [x] 2.1 Decide the Luxurious chest's Mora and the Remarkable chest's blueprints: options are measuring them from a recording, or keeping both chests unopened until the wiki states them; decides nothing here. Verify: the choice is written into the design before either chest is rewarded.

## 3. Locks by camps

- [x] 3.1 Lock each chest by the enemy camp whose reach it stands in, opening it once the camp is cleared. Verify: tests named after the scenarios 'a chest stays locked while a camp within its reach stands' and 'a chest opens once the camp within its reach is cleared', seen failing first. Built over the provisional twenty-metre reach `CHEST_LOCK_REACH`, which waits on `chest-camp-lock.mkv`.

## 4. Digging and seals

- [x] 4.1 Offer Dig at each buried place and reveal the chest once dug, paying no reward until the tier is measured. Verify: tests named after the scenarios 'a buried chest offers Dig at its place', 'a dug chest appears once dug' and 'a dug chest pays no reward until its tier is measured', seen failing first.
- [ ] 4.2 Free each sealed chest by Pyro for vines or ice, and by a blunt or poise-damaging attack for rock. Verify: tests named after the scenarios 'a chest sealed in vines is freed by Pyro', 'a chest sealed in rock is freed by a blunt attack' and 'a chest sealed in vines is not freed by an attack of another element', seen failing first. Blocked on three things: no published place names the seal it wears, so the map's sealed label cannot be matched to a seal; no strike reaches a chest, as `checkIsSealFreed` has no caller; and `chest-seal-pyro.mkv` is unrecorded, which would settle the seal each place holds. The rule is built as `checkIsSealFreed`, and the row stays unticked until then.

## 5. Locks by puzzles

- [x] 5.1 Lock each chest by the puzzle within its reach, once puzzles stand. Verify: a test named after the scenario 'a chest stays locked while a puzzle within its reach is unsolved', seen failing first. Built over the same provisional reach, with the time trials' solved state as the puzzles' done state.

## 6. Achievements and exploration

- [ ] 6.1 Count each opened chest once, through its own opened record with no join to the game's chest records, toward its area's exploration and its region's chest achievements. Verify: tests named after the scenarios 'an opened chest counts once toward its area's exploration' and 'reopening a chest adds nothing to the count', seen failing first. Built, not ticked: the exploration count is `placeExplorationDoings`, which the exploration progress change built and tested. The chest achievement's match is region-only and provisional (`TRIGGER_OPEN_WORLD_CHEST`, `targetIsRegionOnly`), but the chest-opened event carries no region, and the game's region numbers in the chest rows name no catalogue area, so the achievement does not move in play until they are mapped.
