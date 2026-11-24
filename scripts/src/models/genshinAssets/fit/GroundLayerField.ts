// A grid of each ground layer's share over a region's ground, read bilinearly at any point it holds: its corner in x
// And Z, the side of a cell in metres, its node counts along x and z, and each layer's shares by the layer's name, flat
// In rows along z, a node's shares summing to one
export interface GroundLayerField {
  cellSize: number;
  layers: Record<string, number[]>;
  origin: [number, number];
  size: [number, number];
}
