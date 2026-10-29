// One image's rectangle read: its mean colour, the ink of each row and column as the sum of its pixels' distance from the
// Mean luminance, and the first strong luminance step from each side, in samples from that side (none when the rectangle
// Has no step there)
export interface RectangleSide {
  columnInk: number[];
  edges: { bottom?: number; left?: number; right?: number; top?: number };
  mean: [number, number, number];
  rowInk: number[];
}
