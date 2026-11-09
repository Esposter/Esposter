# Export variants

Options on the PNG and SVG export (selection only, background, dark mode, scale and embedding the scene), and copying an image to the clipboard as PNG or SVG. The whole-board PNG and SVG export is built.

## Why deferred

Each option adds a control to the export and an input to the one SVG writer, which draws every file from the model ([whiteboard](../../../specs/resource/whiteboard/design.md)). Selection only and scale each need their own pass through that writer. The copy variant puts the same image on the clipboard instead of in a download. The dark-mode option is already settled against: the export does not depend on the editor's theme, so it is not revived here. Embedding the scene would make an image a second copy of the board, which the store already holds. Each option is niche until a reader asks for it, and the whole-board download answers the need until then.

**Revisit when:** a reader asks for a selection-only, scaled or copied export.
