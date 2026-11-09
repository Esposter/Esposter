## Why

An image reaches a whiteboard by the picker or by paste, but not by a drop, which a note accepts. An image has no alt text, so a reader who uses assistive technology meets an unnamed picture, while the note and page images both carry their alt text. The tool lock is reached only by its toolbar button, with no key. Excalidraw, the reference for how a whiteboard feels, takes a dropped file, and locks its tool on a key.

## What Changes

- An image file dropped onto the canvas is stored as a file asset of the whiteboard and placed centred on the point it was dropped, as a note places a dropped image where it lands.
- An image holds alt text, set from the properties panel for a selected image. The text names the image on the canvas and in the SVG export.
- Q toggles the tool lock.
- Stored images are rewritten once to hold empty alt text, so no stored image lacks the field.

## Capabilities

### Modified Capabilities

- `whiteboard`: the drop, the image alt text and the Q key requirements are added.

## Impact

The canvas takes a drop, the image insert takes the point it places at, and the image element gains an alt text field. The export names each image by its alt text. Images placed by the picker and by paste are placed as before, at the centre of the view. Existing images keep their place and their file, and gain empty alt text.
