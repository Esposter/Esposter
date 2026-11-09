# Stats panel

A readout of the selected element's size, position and angle beside the canvas.

## Why deferred

A selection already shows its fill, its stacking and its buttons in the properties panel ([whiteboard layout](../../../specs/resource/whiteboard-layout/design.md)). A readout of size and position is niche for a board of boxes and arrows. The angle has nothing to read, since no element holds one, and [element rotation](../element-rotation/design.md) is deferred with it. The readout earns its place in the panel once rotation is in the model.

**Revisit when:** element rotation is built, so the readout has an angle to show.
