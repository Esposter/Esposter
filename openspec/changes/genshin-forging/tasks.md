## 1. The blacksmith

- [x] 1.1 Place Mondstadt's blacksmith at the Blacksmith point of its scene group record. Verify: a test named after the scenario 'Mondstadt's blacksmith stands at its recorded place' first written and seen failing.

## 2. The screen

- [x] 2.1 Wire the forge screen's container to the forge state, and each queue's obtain through the forge order's obtain. Verify: tests named after the scenarios 'A queue shows its orders' and 'Obtaining a finished order gives its item and Adventure EXP' written first and seen failing.
- [x] 2.2 Label the screen's actions with the forge page's words by text id, and show the refusal words for an order the cap refuses. Verify: tests named after the scenarios 'The forge screen labels its actions in the game's words' and 'An order past the daily cap shows the refusal words' written first and seen failing.
- [ ] 2.3 Measure the screen's layout and its queues' look against the owed recording forge-order-queue.mkv. Verify: the layout compared against that recording, checked by eye.
- [ ] 2.4 Open the screen from the blacksmith's point in the world, beside its place, as the crafting bench opens. Verify: the blacksmith's row is listed in the world and opens the forge screen; wired and linted, not yet run in a world, so the check is owed.
- [x] 2.5 Count each weapon a forge order takes in as a forged weapon at its rarity. Verify: a test named after 'a forge trigger counts a weapon forged at its named rarity, and no other', seen failing first; the screen's emit is untested, since the screen has no emit test.
