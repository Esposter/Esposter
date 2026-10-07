import type { LatheProfile } from "#src/models/genshinAssets/fit/LatheProfile";
import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";

import { fitLatheProfile } from "#src/services/genshinAssets/fit/fitLatheProfile";
import { readLevelOfDetailParts } from "#src/services/genshinAssets/fit/readLevelOfDetailParts";
import {
  TOWER_BAND_HEIGHT,
  TOWER_MESH_REGEX,
  TOWER_RADIUS_TOLERANCE,
} from "#src/services/genshinAssets/shared/constants";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";

// Every placement of a login tower's drawn level, each beside the lathe its tower's most detailed mesh is fitted as
export const readTowerProfiles = async (
  placements: readonly AssetPlacement[],
  meshDirectory: string,
): Promise<{ placement: AssetPlacement & { part: string }; profile: LatheProfile }[]> => {
  const { meshPathMap, partPlacements } = readLevelOfDetailParts(placements, TOWER_MESH_REGEX, meshDirectory);
  const towerProfileMap = new Map<string, LatheProfile>();
  for (const [tower, meshPath] of meshPathMap) {
    // oxlint-disable-next-line no-await-in-loop -- one mesh of tens of thousands of vertices is read at a time
    const { vertices } = await readObjMesh(meshPath);
    towerProfileMap.set(
      tower,
      fitLatheProfile(vertices, { bandHeight: TOWER_BAND_HEIGHT, tolerance: TOWER_RADIUS_TOLERANCE }),
    );
  }
  return partPlacements.flatMap((placement) => {
    const profile = towerProfileMap.get(placement.part);
    return profile ? [{ placement, profile }] : [];
  });
};
