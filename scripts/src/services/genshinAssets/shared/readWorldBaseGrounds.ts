import type { RegionGround } from "genshin-world";

import { readPublishedRegionGround } from "#src/services/genshinAssets/shared/readPublishedRegionGround";
import { readWindriseBaseGrounds } from "genshin-world";

// Windrise's base as the lock holds it, each record read from the dev account and checked against its schema, through
// The selection the world reads its base by: the record alone, or its quarters
export const readWorldBaseGrounds = (lockKeys: readonly string[]): Promise<[RegionGround, ...RegionGround[]]> =>
  readWindriseBaseGrounds(lockKeys, readPublishedRegionGround);
