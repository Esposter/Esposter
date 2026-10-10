// A grid of unit normals over a region, one a cell standing at its centre, read trilinearly at any point the region
// Holds: its corner, the side of a cell in metres, its cell counts along each axis, and the normals flat in x-major
// Order, three numbers each
export interface NormalField {
  cellSize: number;
  normals: number[];
  origin: [number, number, number];
  size: [number, number, number];
}
