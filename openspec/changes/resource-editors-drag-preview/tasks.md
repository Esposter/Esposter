## 1. The shared session

- [x] 1.1 Share the pieces of a drag: the ghost chip, the edge scroll's speed rule, the touch hold's decision and the refusal text, each a tested pure function or component the three editors use. Verify: tests beside `getEdgeScrollVelocity`, `getPressMoveOutcome` and `getDropRefusal`.
- [x] 1.2 Draw the pending insertion through each editor's own render path, the page builder from a derived document and the survey canvas from a derived slot list. Verify: a test named after the scenario 'A palette kind is drawn in the slot it would land in' written first and seen failing.
- [x] 1.3 Cancel on Escape and on a release over no slot. Verify: the page builder's and the survey's drag composable tests; the red run was not captured for each.
- [x] 1.4 Insert or move on release as one history entry. Verify: the drag composable tests, and the survey's `insertNodeAt` test, whose red run was not captured.

## 2. The three editors

- [ ] 2.1 Show the preview, the ghost, the edge scroll and the touch hold in the page builder's webpage and email canvases. Verify: driven in the browser once after the edits. Open: the code and its unit tests are in; no browser run has driven a block over a slot, and the drop index's stability at a boundary rests on the unshifting rule's unit test alone.
- [x] 2.2 Make the survey Creator's palette and canvas draggable. Verify: the resolver's and the composable's tests, whose red run was not captured.
- [ ] 2.3 Give the whiteboard's palette drag a ghost at the pointer. Verify: driven in the browser once after the edits. Open: the ghost and the drag are built and unit-tested; no browser run has dragged an item onto the canvas.

## 3. One press tracker

- [ ] 3.1 Replace the three press trackers with one shared primitive: the window pointer listeners filtered on the press's pointer id, the drag start distance, the touch rest timer and tolerance, the release that swallows the next click, and Escape. The survey's `trackDrag`, the page builder's `trackDrag` and the whiteboard palette's `startDrag` each keep only what differs (what a move draws, what a release lands). Verify: the three composables' tests pass unchanged, with a test per shared rule written first and seen failing. Open: the touch rule differs between the survey (a moved finger ends the press) and the page builder (`getPressMoveOutcome`), so the shared rule needs a design decision first.
