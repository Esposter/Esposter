# Multi-point line

A line tool that draws an open path through three or more points, with no arrowheads, as one element.

## Why deferred

A line through two points is already drawable: an arrow whose two ends both have their arrowheads off. A path through more points has no element kind in the positioned model, which holds shapes, arrows, freehand strokes, text, images and sticky notes ([positioned elements](../../../specs/vue-block-editor-headless/positioned-elements/design.md)). A stroke is an open point list too, but the freehand tool draws it from the pointer's samples, so a line with placed corners would need a kind, a hit test and an export of its own. The positioned-elements design does not define one yet, so the two-point case stays the only line.

**Revisit when:** the positioned-elements design defines a multi-point element kind, or a reader asks for an open path that a two-point line cannot draw.
