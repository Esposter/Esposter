import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";

// The samples of a grid the bar and the gate are read on: every one the piece holds outside its cities
export const selectBarSamples = (grid: TerrainResidualGrid): Float64Array =>
  grid.values.filter((sample) => Number.isFinite(sample));
