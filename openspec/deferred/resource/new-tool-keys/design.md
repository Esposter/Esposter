# New tool keys

The tool keys L, E, F, K, B and X, which wait on their tools, and the number keys, which would repeat the letter keys.

## Why deferred

Each key is a registered command for the tool it chooses, so a key arrives with its tool ([whiteboard](../../../specs/resource/whiteboard/design.md)). L, E, F, K, B and X have no tool yet: the line, eraser, frame, laser, bucket fill and draw-shape tools are each deferred. The number keys would choose the tools the letter keys already choose, so they would repeat them, and every key is listed by the shortcuts dialog.

**Revisit when:** each key's tool is built, and the number keys are still left out.
