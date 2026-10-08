import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { readIndexedAssets } from "#src/services/genshinAssets/shared/readIndexedAssets";

// Every placement's mesh named in place: a mesh a placement names by path ID (a skinned mesh in another file) is named
// Through the asset index, and any other is already its name
export const nameMeshPlacements = async (placements: AssetPlacement[]): Promise<void> => {
  const meshPathIds = new Set(placements.map(({ mesh }) => mesh).filter((mesh) => /^-?\d+$/u.test(mesh)));
  const meshAssets = await readIndexedAssets(({ pathId, type }) => type === AssetType.Mesh && meshPathIds.has(pathId));
  const pathIdMeshMap = new Map(meshAssets.map(({ name, pathId }) => [pathId, name]));
  for (const placement of placements) placement.mesh = pathIdMeshMap.get(placement.mesh) ?? placement.mesh;
};
