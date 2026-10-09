import type { GroundLayer } from "#src/models/terrain/GroundLayer";

// Where a ground's layers lie, fitted to where the game's terrain places its own: a grid of each layer's share, read
// Bilinearly at a point. Its corner in x and z, the side of a cell in metres, its node counts along x and z, and each
// Layer's shares flat in rows along z; a layer the field names nowhere holds none of the ground
export interface GroundLayerField {
  cellSize: number;
  layers: Partial<Record<GroundLayer, readonly number[]>>;
  origin: readonly number[];
  size: readonly number[];
}
