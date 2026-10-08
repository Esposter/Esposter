import type { GaussianHills } from "#src/models/terrain/GaussianHills";
import type { TerrainFeature } from "#src/models/terrain/TerrainFeature";
import type { TerrainResidual } from "#src/models/terrain/TerrainResidual";

// A ground composed in layers: hills, the sharp features they smear, and the residual noise below both
export interface TerrainShape extends GaussianHills {
  features?: TerrainFeature[];
  residual?: TerrainResidual;
}
