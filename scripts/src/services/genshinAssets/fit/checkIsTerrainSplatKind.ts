import type { TerrainSplatKind } from "#src/models/genshinAssets/world/TerrainSplatKind";

import { TerrainSplatKindGroundLayerMap } from "#src/services/genshinAssets/fit/TerrainSplatKindGroundLayerMap";

export const checkIsTerrainSplatKind = (kind: number): kind is TerrainSplatKind =>
  Object.hasOwn(TerrainSplatKindGroundLayerMap, kind);
