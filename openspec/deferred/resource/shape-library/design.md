# Shape library

A library of saved shapes that a reader adds to, browses and reuses on any board.

## Why deferred

The whiteboard layout design lists a stencil library under Not built: the shapes are the ones the shape slot holds ([whiteboard layout](../../../specs/resource/whiteboard-layout/design.md)). A library is a store of saved element definitions for each person, which the app has no model for, and it would sit outside any one board. A reader who wants a shape again can copy it and paste it on another board, since copied elements travel between open boards as marked text ([whiteboard](../../../specs/resource/whiteboard/design.md)). The library waits until shapes repeat across boards often enough that copy and paste stops serving readers.

**Revisit when:** a reader asks to reuse the same shapes on several boards, and copy and paste does not serve them.
