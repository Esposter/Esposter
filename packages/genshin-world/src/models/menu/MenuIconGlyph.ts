import type { GlyphLayer } from "#src/models/hud/GlyphLayer";

// A traced icon of the Paimon menu: its paths in the box it was traced from, placed by its box's top left in the
// Reference's pixels, the screen's or its tile's. An icon the game draws in more than one tone lays its paler ones
// Under its white, each a shape drawn in its share of the white
export interface MenuIconGlyph {
  height: number;
  paleLayers?: readonly GlyphLayer[];
  paths: readonly string[];
  width: number;
  x: number;
  y: number;
}
