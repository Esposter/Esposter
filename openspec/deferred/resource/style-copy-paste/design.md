# Style copy and paste

Copying one element's style and pasting it onto another, with its own key pair.

## Why deferred

A copied style is the stroke colour, width, dash and fill of an element. Only the fill is a per-element field on shapes and sticky notes today, beside the width a freehand stroke stores for itself ([whiteboard](../../../specs/resource/whiteboard/design.md)). The stroke colour and dash of a shape are not per-element fields yet, so a style copy would carry one property at most. The shortcut waits on the styling it copies.

**Revisit when:** per-element stroke and fill styling is built.
