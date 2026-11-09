# Canvas background colour

A board-wide background colour for the canvas, set from the board's own controls.

## Why not

The whiteboard keeps no document setting for the canvas. Its properties panel is absent with nothing selected, because the document has no setting that needs one ([whiteboard layout](../../../specs/resource/whiteboard-layout/design.md)). The canvas is transparent over the page, so it takes the app's own surface and follows its light and dark mode. A board colour would be a second surface that a reader sets against that theme.
