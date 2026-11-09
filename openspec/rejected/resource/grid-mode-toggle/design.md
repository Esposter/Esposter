# Grid mode toggle

A dot grid on the canvas, with a toggle to show or hide it and a heavier line every fifth grid line.

## Why not

The canvas is plain and nothing snaps, and the [whiteboard design](../../../specs/resource/whiteboard/design.md) settles that. It rejected a dot grid with snap on by default, since the snap put elements away from the pointer for a reason nothing on the canvas explained. It also rejected keeping the snap with the grid hidden, which keeps the surprise and removes its only explanation. A toggle would bring the grid back as a setting for the same reason, so there is no grid and no toggle.
