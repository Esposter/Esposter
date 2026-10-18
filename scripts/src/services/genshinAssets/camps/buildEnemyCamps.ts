import type { MapPointPlace } from "#src/models/genshinAssets/points/MapPointPlace";
import type { EnemyCamp, EnemyKindId } from "genshin-world";

import { clusterEnemyMarks } from "#src/services/genshinAssets/camps/clusterEnemyMarks";
import { CAMP_CLUSTER_DISTANCE, CAMP_LEVEL } from "#src/services/genshinAssets/camps/constants";

// A region's camps from its enemy marks, each mark an enemy at its position with the estimated level. Marks are grouped by
// The area they stand in, so a camp never spans two areas, and a mark in no area is left out. Camps are named by their
// Region and their place in the order they were clustered, and no enemy has a patrol yet
export const buildEnemyCamps = (
  region: string,
  places: readonly MapPointPlace<EnemyKindId>[],
  areaIdAt: (x: number, z: number) => string | undefined,
): EnemyCamp[] => {
  const areaPlacesMap = new Map<string, MapPointPlace<EnemyKindId>[]>();
  for (const place of places) {
    const areaId = areaIdAt(place.position.x, place.position.z);
    if (areaId !== undefined) areaPlacesMap.set(areaId, [...(areaPlacesMap.get(areaId) ?? []), place]);
  }
  return [...areaPlacesMap]
    .flatMap(([areaId, areaPlaces]) =>
      clusterEnemyMarks(areaPlaces, CAMP_CLUSTER_DISTANCE).map((camp) => ({ areaId, camp })),
    )
    .map(({ areaId, camp }, index) => ({
      areaId,
      id: `${region}-camp-${index + 1}`,
      members: camp.map(({ id, kind, position }) => ({
        enemyKindId: kind,
        id,
        level: CAMP_LEVEL,
        patrol: [],
        position: { x: position.x, z: position.z },
      })),
    }));
};
