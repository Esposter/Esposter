# Canvas accessibility

Focus order across a board's elements, keyboard placement on the canvas, and a screen-reader name for each element. The canvas already takes focus and carries a name.

## Why deferred

The canvas is one focusable region with a name, and its elements are drawn with no role or label of their own ([whiteboard](../../../specs/resource/whiteboard/design.md)). A focus order across elements, and a keyboard way to place one, need an accessibility design for the canvas, which the whiteboard does not have. Naming each element is part of that design, because it decides what a name says for each kind of element.

**Revisit when:** an accessibility pass on the canvas is commissioned.
