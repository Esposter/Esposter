// One paving stone's prism at its own origin, in metres: its outline's radius from the origin at equal angles about y,
// starting at +x and turning toward +z, and the heights of its top and bottom
export interface PavingStoneShape {
  bottom: number;
  radii: readonly number[];
  top: number;
}
