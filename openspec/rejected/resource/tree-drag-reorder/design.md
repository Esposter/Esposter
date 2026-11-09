# Tree Drag Reorder

Reordering a layer by dragging it within the layers tree. It covers the email row "Reorder layers by dragging" and the webpage row "Reorder layers by dragging". GrapesJS makes its layers sortable by pointer, and our tree reorders from the keyboard only.

## Why not

A node already moves without a pointer. The Alt-arrow moves go among its siblings and out to its parent, Move up and Move down sit in the toolbar, and Move to lists every slot that takes the node ([canvas design](../../../specs/resource/page-builder/canvas/design.md)). The same design routes the pointer reorder through a node's handle on the canvas, which is not built yet. A pointer drag in the tree would be a second route to the same move, beside the one the canvas already plans.
