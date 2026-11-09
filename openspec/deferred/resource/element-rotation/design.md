# Element rotation

A rotation handle that turns a box element about its centre.

## Why deferred

A box element holds a position and a size and no angle ([positioned elements](../../../specs/vue-block-editor-headless/positioned-elements/design.md)). Rotation needs an angle on the model, a hit test that tests the turned outline, and connection points that turn with the shape. The four connection points are numbered from the top clockwise, and an arrow binds to one by its index, so a turned shape would also need its bound arrows rerouted to the turned points. None of the three exists yet.

**Revisit when:** the angle field and the rotated hit test are both designed.
