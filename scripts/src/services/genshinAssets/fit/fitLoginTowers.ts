import type { TowerPlacement } from "#src/models/genshinAssets/fit/TowerPlacement";
import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";

import { composeLatheAxisPoint } from "#src/services/genshinAssets/fit/composeLatheAxisPoint";
import { readTowerProfiles } from "#src/services/genshinAssets/fit/readTowerProfiles";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { ROTATION_DECIMALS, SCALE_DECIMALS } from "#src/services/genshinAssets/shared/constants";
import { toRightHandedRotation } from "#src/services/genshinAssets/shared/toRightHandedRotation";
import { ID_SEPARATOR } from "@esposter/shared";

// Where the login scene stands its towers: one instance wherever any level of detail of a tower stands, at the foot of
// The axis its most detailed mesh is fitted round, turned as the game turns it, at its scale. Each tower's lathe and
// Surface are `fitLoginTowerFacades`'s
export const fitLoginTowers = async (
  placements: readonly AssetPlacement[],
  meshDirectory: string,
): Promise<{ placements: TowerPlacement[] }> => {
  const keyInstanceMap = new Map<string, TowerPlacement>();
  for (const { placement, profile } of await readTowerProfiles(placements, meshDirectory)) {
    const [x = 0, y = 0, z = 0] = composeLatheAxisPoint(profile, placement, 0).map((value) => roundFitted(value));
    keyInstanceMap.set(`${placement.part}${ID_SEPARATOR}${x},${y},${z}`, {
      position: [x, y, z],
      rotation: toRightHandedRotation(placement.rotation).map(
        (value) => Math.round(value * ROTATION_DECIMALS) / ROTATION_DECIMALS,
      ),
      scale: roundFitted(placement.scale[0], SCALE_DECIMALS),
      tower: placement.part,
    });
  }
  return { placements: [...keyInstanceMap.values()] };
};
