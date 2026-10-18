import type { RegionGround } from "#src/models/world/RegionGround";

import { WINDRISE_GROUND_REGION } from "#src/services/world/constants";
import { selectRegionGroundKeys } from "#src/services/world/selectRegionGroundKeys";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Windrise's base as the lock holds it, read through the selection every region's ground is: its record alone, or its
// Quarters in the lock's order. The first is the world's base, the one every other ground is lifted over as it is composed
export const readWindriseBaseGrounds = async (
  lockKeys: readonly string[],
  readGround: (key: string) => Promise<RegionGround>,
): Promise<[RegionGround, ...RegionGround[]]> => {
  const [baseGround, ...quarters] = await Promise.all(
    selectRegionGroundKeys(lockKeys, WINDRISE_GROUND_REGION).map((key) => readGround(key)),
  );
  if (!baseGround)
    throw new InvalidOperationError(Operation.Read, WINDRISE_GROUND_REGION, "has neither a ground record nor quarters");
  return [baseGround, ...quarters];
};
