## Why

The whiteboard places an element where the pointer puts it, with no alignment aid, so lining shapes up is done by eye. The whiteboard design deferred object snapping until the style panel and the selection handles had shipped, so the reader has the controls the guides serve. Both have shipped: the properties panel holds fill, stacking, duplicate and delete, and shapes resize from handles.

## What Changes

- A shape, sticky note or text box dragged on the canvas snaps its edges and centre to the nearest edge or centre of another element within a short distance, and a guide line shows the alignment while the drag runs.
- Edge midpoints of the other elements are snap points too, which is midpoint snapping on the same system.
- Holding Alt during a drag turns the snapping off for that drag only.
- Snapping adds no setting and no grid.

## Capabilities

### Modified Capabilities

- whiteboard (resource/whiteboard): an element dragged near another element's edge or centre snaps to it, with a guide while the drag runs.

## Impact

The move gesture reads the other elements' bounds and returns a snapped position with the guides it drew. The canvas's overlay slot draws the guides above the elements through `EditorSnapGuides.vue`, and the guides clear when the drag ends. Nothing is stored: a snapped position is the element's ordinary position, so no stored document changes.
