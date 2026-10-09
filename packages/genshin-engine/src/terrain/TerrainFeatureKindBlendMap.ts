import type { TerrainFeature } from "#src/models/terrain/TerrainFeature";

import { TerrainFeatureKind } from "#src/models/terrain/TerrainFeatureKind";
import { getCliffBlend } from "#src/terrain/getCliffBlend";
import { getPlateauBlend } from "#src/terrain/getPlateauBlend";
import { getRidgeBlend } from "#src/terrain/getRidgeBlend";

// The share of each kind of feature's height it stands at a point, from all of it to none past its reach
export const TerrainFeatureKindBlendMap: {
  [K in TerrainFeatureKind]: (feature: Extract<TerrainFeature, { kind: K }>, x: number, z: number) => number;
} = {
  [TerrainFeatureKind.Cliff]: getCliffBlend,
  [TerrainFeatureKind.Plateau]: getPlateauBlend,
  [TerrainFeatureKind.Ridge]: getRidgeBlend,
};
