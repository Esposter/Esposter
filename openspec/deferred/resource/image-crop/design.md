# Image crop

Trimming a placed image to a region of itself, with a crop editor on the canvas.

## Why deferred

An image element holds its size and the id of its file, and nothing that clips the picture ([positioned elements](../../../specs/vue-block-editor-headless/positioned-elements/design.md)). A crop needs a crop region stored on the element, a crop editor that moves the region's edges over the image, and an export that clips the picture to the same region, so the editor and the file agree. The model has none of these. Until a reader asks to trim an image on the board, a picture is placed whole, and a reader can trim the file in another tool before inserting it.

**Revisit when:** a reader asks to trim an image on the board instead of before inserting it.
