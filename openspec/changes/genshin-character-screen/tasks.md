## 1. Screen frame and rects

- [ ] 1.1 Export the character screen's tree and publish its fitted rects, so the tabs' and the panel's paths are in the published record. Verify: `pnpm -C scripts genshin:assets fit character --only interfaceRects` publishes the record and prints the tab paths.
- [ ] 1.2 Place the screen's look by the fitted rects, replacing every provisional value. Verify: `pnpm -C scripts genshin:parity compare character-attributes` and the other four tabs' references do not fall below the scores the character screen page holds.

## 2. Model and element

- [ ] 2.1 Stand the chosen character's model in the middle over its element's background. Verify: a test named after the scenario 'the chosen character stands in the middle over its element's background', seen failing first.
- [x] 2.2 Show the element mark at the top left, the Traveler's as its alignment's. Verify: tests named after the scenarios 'the element mark shows the chosen character's element' and 'the Traveler's mark shows its alignment', seen failing first.

## 3. Details

- [x] 3.1 Open Details from the Attributes tab with every attribute in three groups. Verify: tests named after the scenarios 'Details lists the advanced and elemental attributes beyond the summary' and 'pressing Details again closes the list', seen failing first.

## 4. Levelling and ascension

- [ ] 4.1 Spend Character EXP materials on Level Up. Verify: tests named after the scenarios 'Level Up spends Character EXP materials' and 'Level Up is refused without enough Character EXP materials', seen failing first.
- [ ] 4.2 Ascend at a phase's cap once the Adventure Rank allows it. Verify: tests named after the scenarios 'Ascend spends the phase's materials and Mora at its cap' and 'Ascend is refused below the phase's Adventure Rank', seen failing first.
- [ ] 4.3 Lift a character past level 90 with Masterless Stella Fortuna to 95 and 100. Verify: tests named after the scenarios 'Masterless Stella Fortuna lifts a character from level 90 to 95' and 'Masterless Stella Fortuna lifts a character from level 95 to 100', seen failing first.

## 5. Profile and Traveler

- [ ] 5.1 Give the Traveler the element of each statue resonated with, and a bonus for each element. Verify: tests named after the scenarios 'the Traveler takes the element of the statue it resonates with' and 'each element resonated with adds a bonus', seen failing first.
- [ ] 5.2 List the voice-over lines on the Profile tab once the character model's terms are in place. Verify: a test named after the scenario 'the Profile tab lists the character's voice-over lines', seen failing first.
