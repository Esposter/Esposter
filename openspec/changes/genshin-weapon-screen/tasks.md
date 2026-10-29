## 1. Screen and labels

- [x] 1.1 Open the weapon screen on a weapon the player holds, showing its name, rarity, level, EXP towards the next level, phase and refinement rank. Verify: a test named after the scenario 'the weapon screen opens on a held weapon', seen failing first.
- [x] 1.2 Name the three actions in the game's own words for the reader's game language. Verify: a test named after the scenario 'the action labels read in the reader's game language', seen failing first.

## 2. Actions

- [x] 2.1 Enhance the weapon with the ores and fodder weapons the player picks. Verify: tests named after the scenarios 'Enhance applies the chosen ores and fodder' and 'Enhance is refused when the wallet is short of Mora', seen failing first.
- [x] 2.2 Offer Ascend only at the level cap, and refuse it while the player's rank sits below the phase's gate. Verify: tests named after the scenarios 'Ascend is offered only at the level cap', 'Ascend spends the phase's Mora and items' and 'Ascend is refused below the Adventure Rank', seen failing first.
- [x] 2.3 Refine with a copy or a refinement material, up to rank five. Verify: tests named after the scenarios 'Refine adds a rank for a copy and the rank's Mora', 'Refine is not offered at rank five' and 'Refine is not offered for a two-star weapon', seen failing first.

## 3. Look

- [ ] 3.1 Place the frame by its measured rects, and compare its look with the weapon-levelling reference clip. Verify: the comparison is run by the `genshin-parity` loop and queued for the user's eyes.

## 4. Passive

- [ ] 4.1 Show each passive on the screen once the weapon enhancement's passive data lands and the layout beneath the fodder grid is measured against the game reference, with a weapon that has none showing nothing. The list is withdrawn until then (the design's Decisions). Verify: the passive display tests that change owns pass when mounted on this screen. Blocked until that change's data task lands and the layout is measured; the passive's effect waits on the character kits. The service this task mounts, `getWeaponPassive`, has no production caller until then and is kept on purpose; if the list is dropped instead, the service and its test are deleted, which is that choice's to make here, not a cleanup.

## 5. The Enhance strip

- [ ] 5.1 Fit the Enhance strip to its seven slots and show the candidates past the seventh. The strip's `.enhance-cells` is 714 units wide with a 13 unit gap, and its seven `.cell`s at 98.5 units total 767.5 units, so the seventh slot is clipped at about 48 units and any fodder past it is hidden and unclickable (`packages/genshin-world/src/components/Weapon/Screen/Index.vue`). The arithmetic does not say which of the three numbers the reference measured, so the reference frame decides the cell width, the gap or the strip's width; and the overflow past seven needs a choice of scroll, paging or a second row, which the design does not make. Verify: a test named after the chosen scenario, seen failing first, with eight candidates in the bag, every one reachable. Blocked on the reference frame and that choice.
