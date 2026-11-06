# Editor drag preview

## Why

A drag in the page builder shows a drop line or a dashed outline and nothing of the block that would land, so the reader releases to find out. The survey Creator cannot be dragged at all, and the whiteboard's drag draws no ghost. Each editor wrote its own pointer handling, and the page builder's lacks the autoscroll and the touch hold its own spec promises.

## What Changes

One drag session serves the page builder, the survey Creator and the whiteboard, and shows the block where it would land.

- A drag from a palette, or of a node already placed, draws a ghost chip at the pointer and the block itself in the slot it would land in, with its neighbours shifted to make room.
- A release over a slot that accepts the kind inserts or moves it as one history entry; a release elsewhere inserts nothing and the refusal is shown while the pointer is over it.
- Escape cancels the drag, a frame's edge autoscrolls it, and a touch drag starts after a short hold.
- The survey Creator is draggable from its palette and on its canvas, with the keyboard moves as the twin.

## Capabilities

- **resource/editor-drag-preview** (new)

## Impact

The page builder's drag composable and overlays, the survey Creator's palette and canvas, and the whiteboard's palette item change onto the shared session. The survey Creator's two recorded decisions against dragging are overturned.
