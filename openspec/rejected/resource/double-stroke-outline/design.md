# Double stroke outline

Drawing each outline as two overlapping strokes, as a hand-drawn sketch is often drawn, rather than one.

## Why not

The [whiteboard design](../../../specs/resource/whiteboard/design.md) settles it. Each outline is one closed path, sketched point by point from the element's id, so the same element draws the same sketch in the editor and the export. The design records that the plan named two strokes and that the built outline is one. A second stroke would double every outline's path data for a look the roughness levels carry, and the export would have to draw both.
