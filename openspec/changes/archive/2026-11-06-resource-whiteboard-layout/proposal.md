# Whiteboard layout

## Why

The whiteboard is a freeform canvas, yet its screen is a left palette of shapes and notes with a search field, a tool row in the top-left corner, a zoom row in the bottom-left corner and a panel floating in the top-right. A reader who wants a rectangle looks in the palette, a reader who wants the arrow looks in the tool row, and the two are different gestures: a shape is dragged out of a list, an arrow is chosen and then drawn. Excalidraw puts every one of these in one toolbar and draws a thing by choosing its tool and drawing it.

## What Changes

- Every tool is in one top toolbar: select, hand, the shapes in one slot, arrow, freehand, text, sticky note and image.
- A shape, a text box or a sticky note is placed by choosing its tool and clicking or dragging on the canvas, and the tool returns to select after one placement unless it is locked.
- The palette and its search are removed, since the toolbar holds what it held.
- A contextual panel opens on the start edge over the canvas for a selection, with the content of what is selected, and is absent with nothing selected.
- Undo and redo sit beside zoom, and every tool has a shortcut.
- On a compact window the toolbar sits at the bottom edge and the panel opens from a button.

## Capabilities

- **resource/whiteboard-layout** (new)

## Impact

The whiteboard's editor component is replaced by a layout and a registry on the [editor shell](../resource-editor-shell/design.md). The gesture reducer gains one gesture, placing the armed element, and loses the palette's drag. The document, its commands and the export do not change.
