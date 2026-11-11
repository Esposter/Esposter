# Tasks

## 1. Snapping a move

- [ ] 1.1 Snap a dragged element's edges and centre to the nearest other element's edge or centre within the snap distance, in the move gesture, leaving the position unchanged when nothing is in range. Verify: tests named after the scenarios 'A dragged element snaps its edge to a neighbour's edge' and 'An element outside the snap distance does not snap' written first and seen failing.
- [ ] 1.2 Snap to edge midpoints of the other elements through the same snap. Verify: a test named after the scenario 'A dragged element snaps its centre to a neighbour's edge midpoint' written first and seen failing.
- [ ] 1.3 Skip the snap while Alt is held for the drag. Verify: a test named after the scenario 'Holding Alt places the element exactly where the pointer is' written first and seen failing.

## 2. Guides

- [ ] 2.1 Draw a guide line for each alignment the drag holds, above the elements, and clear the guides when the drag ends. Verify: a test named after the scenario 'A guide shows while the drag holds an alignment and clears at its end' written first and seen failing.

## 3. The record

- [ ] 3.1 Narrow the plain-canvas requirement to a move that does not snap, and keep the snap distance as one constant in screen pixels. Verify: tests named after the scenarios 'A moved shape lands where the pointer puts it' and 'The canvas draws no grid' still pass.
- [ ] 3.2 Update the whiteboard design's Decisions so 'nothing snaps' says snapping applies during a drag, and move object snapping from its deferred sentence to Features. Verify: `pnpm exec openspec validate resource-whiteboard-object-snapping --strict --no-interactive` passes.
