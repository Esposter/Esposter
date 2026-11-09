# Arrow binding toggle

A switch that turns arrow binding off for the whole board, so that arrows never attach to shapes.

## Why not

Each arrow end can already be detached from the properties panel, and a detached end stays where it was bound, as the [whiteboard spec](../../../specs/resource/whiteboard/spec.md) requires. An arrow drawn from empty space is free at that end from the start, so a board with no bindings is already possible without a switch. A board-wide switch would add a second binding mode that every arrow and every move would have to read, for what the per-end detach already does one end at a time.
