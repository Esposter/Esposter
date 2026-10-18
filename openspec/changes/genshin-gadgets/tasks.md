## 1. Gadgets in the bag

- [x] 1.1 Make each gadget a bag item of the widget material type, filed under the gadget category. Verify: a test named after the scenario 'A gadget appears in the gadget tab' written first and seen failing.
- [x] 1.2 Equip an equipable gadget from its tab and refuse one the game does not mark equipable. Verify: tests named after the scenarios 'An equipable gadget is equipped from its tab' and 'A gadget the game does not mark equipable is refused' written first and seen failing.

## 2. The quick-use slot

- [x] 2.1 Use the equipped gadget on Z and show its cooldown on the HUD. Verify: tests named after the scenarios 'Z uses the equipped gadget' and 'Z does nothing while the gadget's cooldown runs' written first and seen failing.
- [x] 2.2 Open the quick swap on holding Z with up to four gadgets. Verify: tests named after the scenarios 'Holding Z opens the quick swap' and 'The quick swap does not hold a fifth gadget' written first and seen failing.

## 3. Detectors

- [x] 3.1 Point a Treasure Compass to the nearest treasure box once its city joins a region's chest slice. Verify: a test named after the scenario 'A compass points to the nearest box in its city' written first and seen failing.
- [x] 3.2 Point a Seelie detector to the nearest Seelie crystal in its city. Verify: a test named after the scenario 'A Seelie detector points to the nearest crystal in its city' written first and seen failing.
- [x] 3.3 Decide the Oculus Resonance Stone's detector. Options: read its target from a table other than the config, or leave the stone without a detector until a target is found. Decides nothing here; the choice is recorded before the stone's detector is built.

## 4. Collectors and placed devices

- [x] 4.1 Build the collector and placed-device kinds one at a time, each as its own module, with a scenario for each kind added to this change's specs before its module is built. Verify: the new scenario written first and seen failing.

## 5. The quick swap's slots in the bag and the save

- [x] 5.1 Hold the quick swap's slots in the bag and the save, required and at most four, and count them in the save's size ceiling. Verify: tests named after the scenarios 'A save with a fifth quick swap slot is refused' and 'A save without quick swap slots is refused' in `models/save/GenshinSave.test.ts` written first and seen failing; the cap save holds four ids and is accepted.
- [x] 5.2 Keep the bag's quick swap slots, and its equipped gadget, through every change that rebuilds the bag. Verify: test named after the scenario 'Taking an item into the bag keeps the quick swap slots' in `services/inventory/addInventoryItem.test.ts` written first and seen failing; the other rebuilds (eating, cooking, forging, offering, destroying, learning and talents) spread the bag and are checked by their suites.
- [x] 5.3 Keep the account's quick swap slots on a merge. Verify: test named after the scenario 'A merge keeps the account's quick swap slots' in `services/save/mergeGenshinSave.test.ts`. It passes on the bag the merge already takes whole, so it guards the bag from a rebuild rather than failing first.

## 6. The equipped gadget's disc

- [ ] 6.1 Draw the equipped gadget's icon on its disc. Blocked: no gadget's icon is read. Each gadget's icon is one traced glyph from a clean frame of its own (the `genshin-parity` glyph process), which the PC's export and the main session's publish supply. Verify: `Hud/Skills/Index.vue` draws the glyph in the disc once one is read, checked in the main session's browser run.
- [x] 6.2 Measure the disc's place and its countdown from the reference frames, and keep the place they confirm. Verify: the measured place is recorded in `design.md` Decisions; the place is CSS, so no unit test checks it, and the main session's browser run is its check.

## 7. The save's backfill, owed to the main session

- [ ] 7.1 Set the quick swap slots of every saved bag to none, dev then prod, with the rule in `design.md`. Blocked: the session does not run a backfill or publish from this worktree; the main session runs it. Verify: the backfill's dry run prints no changed document on its second pass.
