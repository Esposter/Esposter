# Tasks

## 1. Align and distribute

- [x] 1.1 Align a selection of two or more boxes to one of six edges or centres, as one edit, with the align controls disabled below two boxes. Verify: the tests named 'Aligning to the left edge moves each box to the leftmost edge', 'Aligning leaves a free arrow where it was' and 'Align is disabled when fewer than two boxes are selected' written first in a new getAlignOperations.test.ts and seen failing.
- [x] 1.2 Distribute three or more boxes with equal gaps, horizontally or vertically, with the distribute controls disabled below three. Verify: the tests named 'Distributing horizontally makes every gap equal' and 'Distribute is disabled below three boxes' written first in a new getDistributeOperations.test.ts and seen failing.

## 2. Stacking a selection

- [x] 2.1 Stack a selection as one edit, keeping its order, with bring forward and bring to front disabled when the selection holds the top element. Verify: the tests named 'Bring to front lifts a selection above the rest in its order', 'Bring forward moves a selection one step past the element above it' and 'A selection holding the top element cannot bring forward' written first in a new getStackOperations.test.ts and seen failing.
- [x] 2.2 Bind the bracket keys to the selection's stacking, with Shift taking it to the ends, and bind nothing with no selection. Verify: the tests named 'The bracket keys stack the selection', 'Shift with the bracket keys sends the selection to the ends' and 'The stacking keys do nothing with no selection' written first in useWhiteboardArrangeKeyboard.test.ts and seen failing. The keys live in their own composable, so the tests do too, since useWhiteboardKeyboard.ts was being changed beside this change.

## 3. The record

- [x] 3.1 Record align, distribute and the selection's stacking in the whiteboard design's Features, and remove the selection stacking gap from its Not built list. Verify: `pnpm exec openspec validate resource-whiteboard-arrange-elements --strict --no-interactive` passes.
