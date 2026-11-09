## Why

The canvas outlines a node under the pointer but does not name it, so an author pointing at a block cannot tell its type without finding it in the layers tree. A placed node also cannot be moved by dragging: a drag starts only from a palette block, so a move across the page is a run of Move up, Move down and Move to. The reference editor names a hovered element and moves a placed one by a handle in its toolbar.

## What Changes

- A hovered node's outline carries the name the layers tree gives it, and the name goes when the pointer leaves the node.
- A selected node's toolbar gains a move handle. Dragging the handle moves the node into the nearest slot under the pointer that accepts its type, with the drop rules and the cancel of a palette drag.
- A node is not dropped into its own children, and a release over no slot leaves the node where it was.
- A handle move is one undoable change.

## Capabilities

### Modified Capabilities

- `resource/page-builder/canvas`: hover names a node, and a placed node moves by its handle.

## Impact

The canvas draws one more label in its overlay layer, and the node toolbar gains one control. The palette drag's hit test, drop indicator and Escape are reused, not copied. The outline's label adds no height to the page the canvas draws, as the canvas spec already requires of every outline.
