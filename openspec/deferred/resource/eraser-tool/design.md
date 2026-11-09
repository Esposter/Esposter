# Eraser tool

An eraser tool that removes the part of a freehand stroke swept under the pointer.

## Why deferred

A sweep erase cuts a stroke into pieces. The positioned-elements commands are insert, move, resize, bind, unbind, delete, z-order and property update ([positioned elements](../../../specs/vue-block-editor-headless/positioned-elements/design.md)), and none of them splits an element, so the eraser needs a new command before it can cut anything. Today a reader removes a stroke whole with Delete, as every element is removed. The whiteboard layout design lists an eraser under its Not built section ([whiteboard layout](../../../specs/resource/whiteboard-layout/design.md)).

**Revisit when:** a sweep-erase design for freehand-led boards is written, and it adds the split command the eraser would need.
