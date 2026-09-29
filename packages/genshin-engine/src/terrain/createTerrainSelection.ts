import type { TerrainSelection } from "#src/terrain/TerrainSelection";

// A selection with room for this many tiles, allocated once and written every frame
export const createTerrainSelection = (capacity: number): TerrainSelection => ({
  count: 0,
  keys: new Float64Array(capacity),
});
