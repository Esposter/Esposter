# Tasks

## 1. The name on hover

- [ ] 1.1 Draw the hovered node's title from the layers tree inside its outline, at the top edge. Verify: tests named after the scenarios 'Hovering a text node names it on its outline' and 'A node at the top edge of the canvas shows its name' written first and seen failing.
- [ ] 1.2 Clear the name when the pointer leaves the node. Verify: a test named after the scenario 'The name leaves when the pointer leaves the node' written first and seen failing.

## 2. The move handle

- [ ] 2.1 Add the move handle to the node toolbar of the selected node and start the drag from it, through the palette drag's hit test and drop indicator. Verify: tests named after the scenarios 'Dragging a node handle into another column moves it there' and 'Escape cancels a node drag' written first and seen failing.
- [ ] 2.2 Leave a node in place when its drop has no accepting slot, or when its slot is its own subtree. Verify: tests named after the scenarios 'Releasing a node where no slot accepts it leaves it in place' and 'A section cannot be dropped into a section it holds' written first and seen failing.
- [ ] 2.3 Commit a handle move as one history entry, announced as the keyboard move is. Verify: a test named after the scenario 'Undo returns a dragged node to its place' written first and seen failing.

## 3. The record

- [ ] 3.1 Update the canvas design's pointer and overlay paragraphs and its key files to name the label and the handle as built. Verify: `pnpm exec openspec validate resource-page-builder-canvas-overlays --strict --no-interactive` passes.
