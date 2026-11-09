# Object snapping

Snap to objects with alignment guides, which lines a dragged element up with the edges and centres of the others while guide lines show, and midpoint snapping, which uses the same system.

## Why deferred

Nothing snaps on the canvas, and that is settled: the whiteboard has no grid and no snap setting, so an element lands where the pointer puts it ([whiteboard](../../../specs/resource/whiteboard/design.md)). Object snapping is the one alignment aid the design defers. While a drag runs it would measure the other elements' edges and centres, pull the element onto the nearest one and draw the guide. The whiteboard design defers it until the style panel and the selection handles have shipped, so the reader has the controls the guides serve. Midpoint snapping is the same system, so it waits on the same trigger.

**Revisit when:** the style panel and the selection handles have shipped, the trigger the whiteboard design sets.
