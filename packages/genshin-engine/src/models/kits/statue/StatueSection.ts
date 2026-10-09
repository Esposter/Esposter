// One section of a statue part's shaft, from its foot to its head, in metres: its radius about the part's axis at each
// Of the part's angles, the first on +x and the rest turned about the vertical toward +z in order
export interface StatueSection {
  height: number;
  radii: readonly number[];
}
