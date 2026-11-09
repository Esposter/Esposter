# Laser pointer

A laser tool that leaves a fading trail under the pointer, which the other people viewing the board see.

## Why deferred

A laser is shown to everyone on the board, so it is live state, sent as the pointer moves. The whiteboard has no live patches between editors: it autosaves its own document ([whiteboard](../../../specs/resource/whiteboard/design.md)). Live presence is what the [document collaboration](../document-collaboration/design.md) record defers, and the laser cannot be built before it.

**Revisit when:** the document collaboration record is revived and built, which gives a board a live channel.
