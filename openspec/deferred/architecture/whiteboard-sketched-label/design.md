# Whiteboard sketched label

The sketched path and the label that the whiteboard's arrow, shape and sticky note each draw, shared by one drawing the three elements call.

## Why deferred

The [shape look](../../../changes/resource-whiteboard-shape-look/design.md) change rewrites how those three draw their sketch, giving each a sketch level of its own that the canvas and the export both draw. A shared drawing built first would be rewritten by that change, since the level is set per element.

## Revisit when

The shape look change has been archived. Then the three either draw the sketch the same way, and the drawing can be shared, or they keep their own on purpose.
