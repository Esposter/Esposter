import type { AssetPlacement } from "#src/models/genshinAssets/AssetPlacement";

import { readIndexedAssets } from "#src/services/genshinAssets/readIndexedAssets";

// The name of every material the placements draw with, by its path ID, as the asset index names it
export const readMaterialNames = async (placements: readonly AssetPlacement[]): Promise<Map<string, string>> => {
  const pathIds = new Set(placements.flatMap(({ materials }) => materials));
  const indexed = await readIndexedAssets(({ pathId }) => pathIds.has(pathId));
  return new Map(indexed.map(({ name, pathId }) => [pathId, name]));
};
