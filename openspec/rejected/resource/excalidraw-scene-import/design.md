# Excalidraw scene import

Opening an Excalidraw scene file as a board, with its elements converted to the whiteboard's own.

## Why not

The store holds each board as a positioned document, and SVG and PNG are the exports ([whiteboard](../../../specs/resource/whiteboard/design.md)). An Excalidraw scene is a different document. Some of its element types have no counterpart here, such as the line, the frame and the embed, and a shape here holds its own text where Excalidraw keeps the text bound to a shape as a separate element. A conversion would drop elements or invent them. The [rejected third-party engine](../whiteboard-third-party-engine/design.md) record already keeps other products' engines out of the whiteboard.
