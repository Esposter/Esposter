// A traced icon of the Paimon menu: its paths in the box it was traced from, placed by its box's top left in the
// Reference's pixels, the screen's or its tile's
export interface MenuIconGlyph {
  height: number;
  paths: readonly string[];
  width: number;
  x: number;
  y: number;
}
