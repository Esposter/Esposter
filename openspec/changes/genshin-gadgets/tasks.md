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
