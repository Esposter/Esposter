import type { MenuFrameIcon } from "#src/models/menu/MenuFrameIcon";
import type { MenuIconGlyph } from "#src/models/menu/MenuIconGlyph";

import { getMenuGlyphStyle } from "#src/services/menu/getMenuGlyphStyle";
import { MenuFrameGlyphMap } from "#src/services/menu/MenuFrameGlyphMap";

// A frame icon drawn inside its button: the button takes the icon's box, and the glyph inside it is zeroed, so it is placed
// at the button's own corner rather than at the menu's
export const getMenuFrameMark = (icon: MenuFrameIcon): { glyph: MenuIconGlyph; style: Record<string, string> } => {
  const glyph = MenuFrameGlyphMap[icon];
  return { glyph: { ...glyph, x: 0, y: 0 }, style: getMenuGlyphStyle(glyph) };
};
