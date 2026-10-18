## 1. Strongbox record

- [x] 1.1 Build each strongbox from its reward preview's display item and its set's offer row, with the set's five-star pieces. Verify: tests named after the scenarios 'a strongbox takes its set and pieces from its display item and offer row' and 'a strongbox with no offer row is left out'.
- [x] 1.2 Read the record from the hosted game data by its key and check it against its shape. Verify: a test named after the scenario 'a strongbox record that does not match its shape is refused', seen failing first.

## 2. Rolling a strongbox

- [x] 2.1 Roll one piece of the chosen set through `rollArtifact` at five stars with the piece's starting minor affixes. Verify: a test named after the scenario 'a strongbox rolls a piece of its chosen set at five stars'.
- [x] 2.2 Share the piece-to-artifact step with the chest drop, which keeps its own suite green. Verify: the existing `rollChestDrops` suite passes unchanged.

## 3. Giving up three artifacts

- [x] 3.1 Take three unlocked five-star bag artifacts into one strongbox artifact in the bag, removing the three. Verify: tests named after the scenarios 'three unlocked five-star artifacts become one strongbox artifact in the bag', 'a locked artifact is not offered', and 'a choice of other than three artifacts is refused'.

## 4. Panel

- [x] 4.1 Open the Mystic Offering from Adventure Rank 45 and no lower. Verify: a test named after the scenario 'the offering opens from adventure rank 45'.
- [x] 4.2 List only the offerable artifacts in the panel, and pass the craft's result to the parent. Verify: a test named after the scenario 'the panel lists only the offerable artifacts'.

- [ ] 4.3 Open the panel from the Crafting Bench from Adventure Rank 45, with the strongbox records read from the hosted game data. Verify: the gate test of 4.1 and the record read of 1.2, once the record is published.

## 5. Words

- [x] 5.1 Add the offering's `GameTextKey` members, each by its text id. Verify: a test named after the scenario 'the offering's tip fills its artifact counts', seen failing first. The six members are in `GameTextKey` already, each by its `UI_MELTING_*` text id, and the tip and the confirm both fill through `computeMysticOfferingText`.
