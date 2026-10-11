import type { SceneExport } from "#src/models/scene/SceneExport";
import type { Landmark } from "#src/models/world/Landmark";

import { LandmarkKindSceneExportFamilyMap } from "#src/services/world/LandmarkKindSceneExportFamilyMap";

// The landmarks the game's exports draw in place of ours: each standing within the ground's extent of an exported family
// Its kind stands in for, as the great oak stands within the exported oak's and a capital within its buildings'
export const getExportedLandmarkIds = (
  landmarks: readonly Landmark[],
  sceneExports: Iterable<SceneExport>,
): Set<string> => {
  const exportedLandmarkIds = new Set<string>();
  const familyBoundsList = Array.from(sceneExports, ({ familyBoundsMap }) => familyBoundsMap);
  for (const {
    id,
    kind,
    position: { x, z },
  } of landmarks) {
    const family = LandmarkKindSceneExportFamilyMap[kind];
    if (
      family !== undefined &&
      familyBoundsList.some((familyBoundsMap) => {
        const bounds = familyBoundsMap.get(family);
        return bounds !== undefined && x >= bounds.min.x && x <= bounds.max.x && z >= bounds.min.z && z <= bounds.max.z;
      })
    )
      exportedLandmarkIds.add(id);
  }
  return exportedLandmarkIds;
};
