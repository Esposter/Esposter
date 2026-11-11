# Object snapping

Snap a dragged element to the edges and centres of the others with alignment guides, and to edge midpoints on the same system.

## Why the trigger has fired

The whiteboard design deferred object snapping until the style panel and the selection handles had shipped. `EditorPropertiesPanel.vue` is the selection panel, and `getResizeHandle.ts`, `ResizeHandle.ts` and `reduceResizingGesture.ts` implement the resize handles. The record was filed in the deferred folder with its trigger still unmet, and this change moves it into the build loop now that the trigger is met.

## Decisions

- **Snapping takes a distance, not a grid.** A dragged edge or centre snaps when it lies within a short distance of another element's edge or centre, and otherwise the element stays where the pointer puts it. Rejected: a dot grid, which the whiteboard design already rejected for putting elements away from the pointer.
- **The guide is drawn while the drag runs.** A guide line shows each alignment the drag currently holds and clears at the drag's end. Rejected: a guide that stays after the drag, which would be a second layer of state the document does not hold.
- **The snap distance is a constant in screen pixels.** It is measured on the screen and converted to document units at the current zoom, so a zoomed-out board snaps no more eagerly than a zoomed-in one. Rejected: a distance in document units, which snaps from far away when zoomed out.
- **Alt is read on every move for the snap and at the press for a copy.** A drag that started with Alt held is a copy of the selection ([selection editing](../resource-whiteboard-selection-editing/design.md)), and Alt held through that drag leaves the copy unsnapped, while releasing it mid-drag lets the next move snap. Rejected: reading Alt once at the press for both, which would make an exact placement impossible to ask for halfway through a drag.
- **Alt turns snapping off for one drag.** The reader can place an element exactly without a setting. Rejected: a snap setting, which the whiteboard design's "nothing snaps" decision had no room for and which this change supersedes only for the drag itself.
- **Snapping is computed in the move gesture.** It takes the other elements' bounds and returns the snapped position with its guides, so a test calls it without mounting the canvas, as the other gestures are tested.
- **Nothing is stored.** A snapped position is the element's ordinary position, so the document format is unchanged and older boards need no backfill.

## Key files

| Source                                                          | Role                                                  |
| :-------------------------------------------------------------- | :---------------------------------------------------- |
| `apps/web/app/services/whiteboard/gesture/getMoveOperations.ts` | The move gesture, which takes the snap                |
| `apps/web/app/services/whiteboard/gesture/getDraggedBounds.ts`  | The dragged element's bounds, read for the snap       |
| `apps/web/app/components/Resource/Whiteboard/EditorCanvas.vue`  | Draws the guides above the elements while a drag runs |
