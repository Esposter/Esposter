// A grid of unit normals over a tree's leaves, read trilinearly at each card vertex: its corner, the side of a cell in
// Metres, its cell counts along each axis, and the normals flat in x-major order, three numbers each
export interface TreeNormalField {
  cellSize: number;
  normals: readonly number[];
  origin: readonly number[];
  size: readonly number[];
}
