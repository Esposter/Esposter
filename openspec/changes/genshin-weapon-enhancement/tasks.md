## 1. Passive data

- [x] 1.1 Read each weapon's passive rows from its skill affix into the weapons' record, ordered by rank, with the zeros past the longest used place cut and a weapon with no affix given none. Verify: `toWeaponPassive.test.ts`, written first and seen failing, asserting rows given out of order come back by rank and a weapon with no affix gives empty values; the scenario 'Passive ranks are shown in refinement order' names the same ordering.
- [x] 1.2 Republish the weapons record from the stats table. Verify: `pnpm -C scripts genshin:assets stats` completes, and the republished weapons record carries the passive fields for each weapon.

## 2. Passives as modules

- [ ] 2.1 Show each passive's name and each rank's description on the weapon. Verify: a test named after 'A weapon with a passive shows its description at its rank' and 'A weapon with no passive shows none'. Open until the game names publish: until then each name and rank reads as empty, so the screen has no text to show.
- [ ] 2.2 Act each passive at its weapon's refinement rank as a module over the kits' shared effects. Verify: tests named after 'A weapon at refinement rank one reads its first passive row' and 'Raising refinement changes the passive's effect'. Built: the static stats of every passive, read from its rows' `addProps` into the weapon's record and carried at the held rank through the character's attribute lines (the Widsith all-damage line waits on an attribute); the weapon's module joins its wielder's kit at the rank it holds, and Full HP Critic Up is its first conditional module. Open: the conditional part of the other passives, each a module of its own (the timed ones over the shared effects, the pricing ones through the kit's pricing hook).
