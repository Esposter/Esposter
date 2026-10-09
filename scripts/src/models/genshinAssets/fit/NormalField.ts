// A grid of unit normals over a region, one a cell, read trilinearly at any point the region holds: its corner, the
// Side of a cell in metres, its cell counts along each axis, and the normals flat in x-major order, three numbers each
export interface NormalField {
  cellSize: number;
  normals: number[];
  origin: [number, number, number];
  size: [number, number, number];
}
