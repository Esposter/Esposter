## 1. Mondstadt's thresholds

- [x] 1.1 Compute a nation's percentage from its areas by the rule for each area's ratio and for summed totals. Verify: computeNationExplorationPercentage.test.ts written first and seen failing, named after the scenario 'Mondstadt's percentage uses summed totals when every ratio is zero'.
- [x] 1.2 Pay each threshold a statue's unlock reaches, once, through the Reputation experience and the item rewards. Verify: a test named after the scenario 'Crossing a threshold pays its reward once' written first and seen failing.

## 2. Doings

- [ ] 2.1 Count each chest and camp in its area once it is opened or cleared, kept with the player's progress. Verify: a test named after the scenario 'An opened chest adds its kind's weight to its area' written first and seen failing.
- [ ] 2.2 Count each waypoint once however often it is unlocked. Verify: a test named after the scenario 'A doing repeated adds its weight only once' written first and seen failing.
- [ ] 2.3 Count each Oculus offered and each puzzle solved once offerings and puzzles record them. Verify: a test named after the scenario 'An opened chest adds its kind's weight to its area' extended to the Oculus and puzzle kinds, written first and seen failing.

## 3. Labels and weights

- [ ] 3.1 Show each area's percentage on its label, rounded down. Verify: a test named after the scenario 'A near-complete area reads below 100' written first and seen failing.
- [ ] 3.2 Re-measure each kind's weight from the owed exploration recording and replace the table's weight of ten where it differs. Verify: the scenario 'An opened chest adds its kind's weight to its area' still passes against the measured weights.
