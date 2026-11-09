# Tasks

## 1. Arrowheads

- [ ] 1.1 Replace each end's flag with a head kind of none, triangle, diamond, circle or bar, and draw each filled head at its end. Verify: the tests named 'An arrow takes a different arrowhead at each end' and 'A patch naming an unknown arrowhead is refused' written first in the headless arrowhead tests and the whiteboard patch tests, and seen failing.
- [ ] 1.2 Choose each end's head from the arrow's panel, one choice per end. Verify: the test named 'An arrow takes a different arrowhead at each end' written first in EditorPropertiesArrow.test.ts and seen failing.
- [ ] 1.3 Rewrite each stored arrow's flag to a head kind, true to triangle and false to none, on dev then prod. It is a throwaway scratchpad script (the backfills skill), guarded by counting each whiteboard's arrows and flags before and after, and run until it reports no flag left. Verify: the run's output, not a test.

## 2. Dragging a free end

- [ ] 2.1 Show a handle on each free end of a selected arrow, and move that end with the pointer as one undo step, leaving a bound end on its shape. Verify: the test named 'Dragging a free end moves that end only' written first in reduceWhiteboardGesture.test.ts and seen failing.
- [ ] 2.2 Bind a dragged end released on a shape, and show no handle on a bound end. Verify: the tests named 'Releasing a dragged end on a shape binds it' and 'An arrow bound at both ends shows no end handle' written first and seen failing.

## 3. The flowchart helper

- [ ] 3.1 Show a connection handle at each connection point of a selected shape, and none on an annotation. Verify: the test named 'An annotation shows no connection handle' written first in reduceWhiteboardGesture.test.ts and seen failing.
- [ ] 3.2 Add a connected shape when a handle is dragged to empty canvas, as one undo step. Verify: the test named 'Dragging a connection handle to empty canvas adds a connected shape' written first and seen failing.
- [ ] 3.3 Join the shape a handle is released on without adding one, and add nothing for a press that does not travel. Verify: the tests named 'Releasing a handle on another shape joins it without adding a shape' and 'A press that does not travel adds nothing' written first and seen failing.

## 4. The record

- [ ] 4.1 Record the head kinds and the two handles in the whiteboard design's Features and Key files. Verify: `pnpm exec openspec validate resource-whiteboard-arrow-editing --strict --no-interactive` passes.
