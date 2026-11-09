# Element opacity

A per-element opacity that makes a shape, a stroke, an arrow or a label translucent.

## Why deferred

Opacity is one more field on each element, and it must reach the editor's drawing and the export, which draws every element from the model ([whiteboard](../../../specs/resource/whiteboard/design.md)). Translucent elements are niche for the diagrams the whiteboard is for. The stroke and fill styling that an opacity would sit beside is not built yet, so a translucent element would style one property before the panel that sets the others exists.

**Revisit when:** a reader asks for a translucent element, after per-element stroke and fill styling is built.
