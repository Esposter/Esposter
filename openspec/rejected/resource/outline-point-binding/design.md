# Outline point binding

Binding an arrow end to any point on a shape's outline, rather than to one of the shape's connection points.

## Why not

Each bound end names one of four connection points, numbered from the top clockwise, and the [positioned elements](../../../specs/vue-block-editor-headless/positioned-elements/design.md) design settles that. The index is what keeps a bound end at its point through a move, and the export draws the same points. A binding to any outline point would store a position along an edge or a curve, and each shape kind would need its own way to recompute it on a move. The nearest connection point is kept instead.
