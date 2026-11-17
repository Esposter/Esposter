import type { TerrainFeature } from "#src/models/terrain/TerrainFeature";
import type { TerrainFeatureKind } from "#src/models/terrain/TerrainFeatureKind";

import { TerrainFeatureKindBlendMap } from "#src/terrain/TerrainFeatureKindBlendMap";

// The share of a feature's height it stands at a point, from its kind's entry in the map. The kind is passed beside the
// Feature, since a feature read off a union of kinds cannot be narrowed to its entry's parameter by its own `kind`
export const getTerrainFeatureBlend = <K extends TerrainFeatureKind>(
  kind: K,
  feature: Extract<TerrainFeature, { kind: K }>,
  x: number,
  z: number,
): number => TerrainFeatureKindBlendMap[kind](feature, x, z);
