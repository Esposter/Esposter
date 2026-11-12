# Tasks

## 1. The spanning box

- [ ] 1.1 Disable the distribute control for a selection in which one box starts no later than every other box and ends no earlier than every other box along the axis, and return no move for it. Verify: the test named after the scenario 'A box that spans the others disables distribute' written first and seen failing.
- [ ] 1.2 Keep the distribute's move unchanged for every other selection: the scenarios 'Distributing horizontally makes every gap equal', 'Distribute is disabled below three boxes' and 'Distribute of boxes that do not span the others is unchanged' keep passing with their existing tests, unedited. The last scenario describes behaviour the code already has, so its test is written against the current code and passes there, a guard rather than a failing-first test. Verify: `pnpm test app/services/whiteboard/arrange/getDistributeOperations.test.ts --run` from `apps/web` passes with no test in it edited.
