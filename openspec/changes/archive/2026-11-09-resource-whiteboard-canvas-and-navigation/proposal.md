## Why

The whiteboard draws a dot grid behind every board and snaps every move, resize and placement to it. Excalidraw, the reference for how a whiteboard feels, draws a plain canvas and places an element where the pointer is. The grid reads as noise behind freehand work, and snapping puts an element away from the pointer with nothing visible to explain it. The canvas is also navigated by buttons alone, where a reader of any whiteboard expects the wheel to pan, a pinch to zoom, and the keyboard to select, copy and paste.

## What Changes

- **BREAKING** The dot grid, the snap and the toolbar's snap toggle are removed. Nothing snaps, and the document has no grid setting.
- The wheel pans the canvas, a pinch or Ctrl or Cmd with the wheel zooms about the pointer, and Space with a drag pans.
- Ctrl or Cmd with 0 resets the zoom, and Shift with 1 or 2 fits the content or the selection.
- Ctrl or Cmd with A selects every element, and Ctrl or Cmd with C, X and V copy, cut and paste elements.

## Capabilities

### Modified Capabilities

- `whiteboard`: the grid and snap requirement is removed, and the plain canvas, the navigation and the selection and clipboard requirements are added.

## Impact

The gesture reducers for moving, resizing and placing lose their snapping step. The editor store loses its snap state. The headless package loses its grid rounding. Every whiteboard whose elements were snapped keeps them where they are, since only the rule that placed them is removed.
