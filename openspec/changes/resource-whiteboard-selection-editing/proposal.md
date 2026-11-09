## Why

A selected element shows a dashed frame and two corner hit zones, with nothing drawn to grab, so a reader cannot see where to resize it from the edges. A selection of several cannot be resized at all. Copying a selection is a key or a footer button that offsets the copy, not a drag that places it under the pointer. Excalidraw, the reference for how a whiteboard feels, draws eight transform handles, scales a selection as one box, and copies on Alt-drag.

## What Changes

- A selected element that takes a size shows a drawn handle on each of its four edges, beside the two corners it already resizes from. A text box shows only its left and right handles.
- A selection of several elements shows the same handles around its box. Dragging one scales every element of the selection in one edit.
- Dragging a selection with Alt held leaves the originals where they are and moves a copy of the selection, which becomes the selection.

## Capabilities

### Modified Capabilities

- `whiteboard`: the edge handles, the resize of several elements and the Alt-drag copy are added as requirements.

## Impact

The resize's handles and the move gesture change. The Duplicate key and footer button keep their offset copy. A resize of one element keeps its minimum size and its arrow reroute. Stored whiteboards need no change, since no element gains a field.
