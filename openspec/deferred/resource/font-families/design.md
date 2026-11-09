# Font families

A choice of text font for each text element, from nine families bundled with the app.

## Why deferred

Every text is drawn in one sans-serif family, and its wrap is an estimate of character widths taken from the font size rather than measured from a family ([positioned elements](../../../specs/vue-block-editor-headless/positioned-elements/design.md)). Another family needs its font file in the app. The export is a standalone SVG drawn from the model, so each family's font would also have to be embedded in the file, or the PNG and the SVG fall back to a default. The wrap estimate would then need a width table for each family. Nothing in the whiteboard's design bundles a font set.

**Revisit when:** a static font bundle is designed, with each family's file embedded in the export.
