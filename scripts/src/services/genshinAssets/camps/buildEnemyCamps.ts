import type { MapPointPlace } from "#src/models/genshinAssets/points/MapPointPlace";
import type { EnemyCamp, EnemyKindId } from "genshin-world";

import { clusterEnemyMarks } from "#src/services/genshinAssets/camps/clusterEnemyMarks";
import { CAMP_CLUSTER_DISTANCE, CAMP_LEVEL } from "#src/services/genshinAssets/camps/constants";

// A region's camps from its enemy marks, each mark an enemy at its position with the estimated level. Camps are named by
// Their region and their place in the order they were clustered, and no enemy has a patrol yet
export const buildEnemyCamps = (region: string, places: readonly MapPointPlace<EnemyKindId>[]): EnemyCamp[] =>
  clusterEnemyMarks(places, CAMP_CLUSTER_DISTANCE).map((camp, index) => ({
    areaId: region,
    id: `${region}-camp-${index + 1}`,
    members: camp.map(({ id, kind, position }) => ({
      enemyKindId: kind,
      id,
      level: CAMP_LEVEL,
      patrol: [],
      position: { x: position.x, z: position.z },
    })),
  }));
