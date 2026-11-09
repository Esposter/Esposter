# Whiteboard theme toggle

A theme switch on the board itself, separate from the app's light and dark mode.

## Why not

The canvas follows the app's light and dark mode. The [design language](../../../specs/architecture/design-language/design.md) palettes share one set of token names, so nothing that reads a token knows which theme is selected, and the board needs no theme of its own. A second whiteboard theme would repeat the switch the app already has. The element fills are fixed colours in the whiteboard's palette, so a theme of its own would also have to remap them.
