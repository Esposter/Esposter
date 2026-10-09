// One section of a statue part's shaft, from its foot to its head, in metres: its ring's centre in the part's own x and
// Z, off its axis, and its radius about that centre at each of the part's angles, the first on +x and the rest turned
// About the axis toward +z in order, with the colour its surface takes at each of those angles, a packed sRGB hex
export interface StatueSection {
  centre: readonly number[];
  colors: readonly number[];
  height: number;
  radii: readonly number[];
}
