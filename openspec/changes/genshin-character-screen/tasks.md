## 1. Screen frame and rects

- [ ] 1.1 Export the character screen's tree and publish its fitted rects, so the tabs' and the panel's paths are in the published record. Verify: `pnpm -C scripts genshin:assets fit character --only interfaceRects` publishes the record and prints the tab paths.
- [ ] 1.2 Place the screen's look by the fitted rects, replacing every provisional value. Verify: `pnpm -C scripts genshin:parity compare character-attributes` and the other four tabs' references do not fall below the scores the character screen page holds.

## 2. Model and element

- [x] 2.1 Stand the chosen character's model in the middle over its element's background. Verify: a test named after the scenario 'the chosen character stands in the middle over its element's background', seen failing first.
- [x] 2.2 Show the element mark at the top left, the Traveler's as its alignment's. Verify: tests named after the scenarios 'the element mark shows the chosen character's element' and 'the Traveler's mark shows its alignment', seen failing first.

## 3. Details

- [x] 3.1 Open Details from the Attributes tab with every attribute in three groups. Verify: tests named after the scenarios 'Details lists the advanced and elemental attributes beyond the summary' and 'pressing Details again closes the list', seen failing first.

## 4. Levelling and ascension

- [x] 4.1 Spend Character EXP materials on Level Up. Verify: tests named after the scenarios 'Level Up spends Character EXP materials' and 'Level Up is refused without enough Character EXP materials', seen failing first.
- [x] 4.2 Ascend at a phase's cap once the Adventure Rank allows it. Verify: tests named after the scenarios 'Ascend spends the phase's materials and Mora at its cap', 'Ascend is refused below the phase's Adventure Rank' and 'Ascend is refused below the phase's level cap', seen failing first.
- [x] 4.3 Lift a character past level 90 with Masterless Stella Fortuna to 95 and 100. Verify: tests named after the scenarios 'Masterless Stella Fortuna lifts a character from level 90 to 95' and 'Masterless Stella Fortuna lifts a character from level 95 to 100', seen failing first.
- [x] 4.4 Share the ascension rule between the character and the weapon. `ascendCharacter` and `ascendWeapon` repeat the gate, the Mora debit and the item take, and differ in two things: the character path also requires the items held through `checkIsItemCountsHeld`, the weapon path does not, and a refusal is `undefined` in one and a thrown `InvalidOperationError` in the other. Decide whether the weapon path gains the item gate, and which refusal style both keep, then move the shared part into one primitive both call. Verify: a test named after the scenario 'a character and a weapon at their cap pay the same phase cost through one rule', seen failing first.

## 5. Profile and Traveler

- [x] 5.1 Give the Traveler the element of each statue resonated with, and a bonus for each element. Verify: tests named after the scenarios 'the Traveler takes the element of the statue it resonates with' and 'each element resonated with adds a bonus', seen failing first.
- [x] 5.2 List the voice-over lines on the Profile tab once the character model's terms are in place. Verify: a test named after the scenario 'the Profile tab lists the character's voice-over lines' in `packages/genshin-world/src/services/profile/getProfileEntries.test.ts`, seen failing first.

## 6. Sub-stat caption

- [x] 6.1 Share the weapon's sub-stat caption between the character screen and the weapon screen, with an empty caption for a weapon that grows no sub-stat. The caption is `getAttributeLabel` (`packages/genshin-world/src/services/character/getAttributeLabel.ts`), which reads `AttributeLabelGameTextKeyMap` through `gameText`. The Character screen's weapons tab (`packages/genshin-world/src/components/Character/Screen/Weapons/Index.vue`) calls it, and so does `useWeaponStats` (`packages/genshin-world/src/composables/useWeaponStats.ts`), which the Weapon screen (`packages/genshin-world/src/components/Weapon/Screen/Index.vue`) reads. The attribute itself still comes from `getSecondaryAttribute`. One lookup for both captions keeps them from drifting apart. Verify: the one lookup both captions go through is getAttributeLabel, called by the Character screen's weapons tab and by useWeaponStats, which the Weapon screen calls, so the shared function is the enforcement and no mount test is owed: a mount test would pin its mocks, not the sharing (the testing skill's what-earns-a-test criterion).
