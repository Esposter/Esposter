## 1. The save keeps the cooking progress

- [x] 1.1 Add the `cooking` slice to the save with its caps, skeleton, empty save and ceiling: the learned dishes, each dish's proficiency and each processing's queue. Verify: `models/save/GenshinSave.test.ts` named after 'the save keeps the learned dishes, the proficiencies and the processing queues'.
- [x] 1.2 Read the slice into the world's progress and queues, and write them back from the world. Verify: `services/save/readGenshinSave.test.ts` named after 'a save's cooking reads back as the progress and queues it holds', and the round trip 'reads every system a save holds back to the same save once written', whose save now carries the cooking slice.
- [x] 1.3 Merge two copies of the cooking slice: the higher proficiency per dish, the union of learned dishes, the later-started queue per processing. Verify: `services/save/mergeGenshinSave.test.ts` named after 'a dish keeps the higher proficiency of the two copies', 'the learned dishes of both copies union' and 'a processing queue keeps the copy started later'.
- [x] 1.4 Hold the progress and queues in the world's save state, not the session, so they load and save with the rest, and a collect that takes nothing leaves the queues as they were, so it writes no save. Verify: `composables/useWorldSave.test.ts` named after 'the cooking progress and queues load from the save', and `services/cooking/collectProcessingJobs.test.ts` named after 'queues with no unit done are returned as the same jobs'.

## 2. The dishes the cook knows

- [ ] 2.1 List the dishes the stove offers as the known ones, from the start and learned, in place of the first known pick. Verify: `services/cooking/openCookingStove.test.ts` named after 'The stove lists the dishes known from the start and the learned ones'.
- [ ] 2.2 Using an instruction item in the bag teaches its dish and takes the item out, and an instruction the dish has taught is not usable. Verify: `services/inventory/useInventoryEntry.test.ts` named after 'Using an instruction teaches its dish', and `services/inventory/checkIsInventoryItemUsable.test.ts` named after 'An instruction item is usable until its dish is learned'.
- [ ] 2.3 Name the instruction items in the items table so the bag holds them. Verify: `scripts/src/services/genshinAssets/items/buildItems.test.ts` named after 'Every instruction item a cook recipe unlocks is an item'. Waits on a publish of the items table, which the main session runs.
- [ ] 2.4 Shop recipe goods and quest rewards deliver their instructions into the bag, so the use in 2.2 reaches them. Verify: the scenario 'Using an instruction teaches its dish' in 2.2 with the bag filled by the shop and quest paths. Waits on the data in 2.3.

## 3. Auto Cook at full proficiency

- [ ] 3.1 Offer Auto Cook on the cooking screen once the dish's proficiency is full, and make the batch through `autoCookRecipe`. Verify: `services/cooking/checkCanAutoCook.test.ts` named after 'Auto Cook is offered at full proficiency' and 'Auto Cook is not offered before full proficiency'.
- [ ] 3.2 Add the `CookingAutoCook` text key for `UI_COOKING_QTE_AUTO_MAKE_BUTTON`. Verify: the key is named in the report; `genshin:text write` is the main session's.
