// A grid of unit normals over a tree's leaves, read trilinearly at each card vertex, each normal standing at its cell's
// Centre: its corner, the side of a cell in metres, its cell counts along each axis, and the normals flat in x-major
// Order, three numbers each
export interface TreeNormalField {
  cellSize: number;
  normals: readonly number[];
  origin: readonly number[];
  size: readonly number[];
}
