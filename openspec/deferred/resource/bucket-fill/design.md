# Bucket fill

A fill tool that colours a closed area by a click inside it, with the area found from the strokes that enclose it.

## Why deferred

A shape takes a fill on its own outline, set in the properties panel. A bucket fill would have to find the closed region around a click from the drawn strokes, and a stroke holds points and a width with no fill of its own ([positioned elements](../../../specs/vue-block-editor-headless/positioned-elements/design.md)). Finding that region is a new engine concept, a search over the document's strokes that the positioned model does not define. The fill tool waits until that search has a design.

**Revisit when:** a reader asks to fill an area enclosed by freehand strokes, and a region search is designed.
