# Tasks

## 1. Handles on the edges

- [ ] 1.1 Show a drawn handle on each edge beside the two corners, and resize along the edge or corner each sits on. A text box shows only its left and right handles, and an arrow or a stroke shows none. Verify: the tests named 'An edge handle changes one dimension only', 'A text box shows only its left and right handles' and 'A selected arrow or stroke shows no resize handle' written first in a new getResizeHandle.test.ts and seen failing.
- [ ] 1.2 Stop a resize at the smallest size an element takes, from an edge handle as from a corner. Verify: the test named 'A resize stops at the smallest size an element takes' written first in reduceWhiteboardGesture.test.ts and seen failing.

## 2. Resizing several

- [ ] 2.1 Show the six handles around the box of a selection of several, and scale each element about the side opposite the handle, in one edit. Verify: the test named 'Dragging a corner of several shapes scales each of them' written first in a new getScaleOperations.test.ts and seen failing.
- [ ] 2.2 Reroute an arrow bound to a resized shape in the same edit, and scale a free arrow end with the selection. Verify: the test named 'An arrow bound to a resized shape follows it' written first in getScaleOperations.test.ts and seen failing.
- [ ] 2.3 Stop the scale where the smallest boxed element reaches its minimum, and show no top or bottom handle on a selection with no height. Verify: the tests named 'A resize of several stops where the smallest element stops' and 'A selection with no height has no top or bottom handle' written first and seen failing.

## 3. Alt-drag copies

- [ ] 3.1 Copy the selection at the originals when a drag starts with Alt held, move the copies with the pointer, and select them, as one undo step. Verify: the tests named 'Alt and a drag leaves the originals and moves the copies' and 'Alt and a drag copies an arrow with the shapes it is bound to' written first in reduceWhiteboardGesture.test.ts and seen failing.
- [ ] 3.2 Add no copy for an Alt press that does not travel. Verify: the test named 'An Alt press without travel copies nothing' written first in reduceWhiteboardGesture.test.ts and seen failing.

## 4. The record

- [ ] 4.1 Update the whiteboard design's Features, Decisions, Not built and Key files to the built shape. Verify: `pnpm exec openspec validate resource-whiteboard-selection-editing --strict --no-interactive` passes.
