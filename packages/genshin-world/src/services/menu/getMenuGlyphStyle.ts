import type { MenuIconGlyph } from "#src/models/menu/MenuIconGlyph";

// A glyph's box in the reference's own pixels, each read by the menu's `--reference-pixel`, one pixel of the 2560 wide
// Reference, so the menu's icons are placed as the English PC client's are at any window's size
export const getMenuGlyphStyle = ({ height, width, x, y }: MenuIconGlyph): Record<string, string> => ({
  height: `calc(var(--reference-pixel) * ${height})`,
  left: `calc(var(--reference-pixel) * ${x})`,
  top: `calc(var(--reference-pixel) * ${y})`,
  width: `calc(var(--reference-pixel) * ${width})`,
});
