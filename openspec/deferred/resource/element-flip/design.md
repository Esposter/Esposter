# Element flip

Mirroring a selected element horizontally or vertically.

## Why deferred

A flip changes what an element draws, and the positioned model does not say what a flip does to the parts that have direction or text ([positioned elements](../../../specs/vue-block-editor-headless/positioned-elements/design.md)). An arrow's ends would swap sides and its arrowheads would move with them, and a text would either turn or read backwards. The whiteboard holds no rule for either, so a flip is a design of its own.

**Revisit when:** a reader asks for a mirrored shape, and the rules for arrow ends and text are written.
