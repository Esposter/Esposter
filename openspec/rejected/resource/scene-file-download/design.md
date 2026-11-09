# Scene file download

Saving a board to a file on disk, as an Excalidraw scene, with a shortcut.

## Why not

The store is the save: a board saves into the resource store as it is edited, and the [account data export](../../../specs/user/data-export/design.md) already carries each resource the person owns. A scene file would be a second copy of the document that can drift from the store. A reader who wants the board as a file has the SVG and PNG exports ([whiteboard](../../../specs/resource/whiteboard/design.md)).
