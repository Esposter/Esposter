import type { RegionGround } from "genshin-world";

import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { readWindriseBaseGrounds, regionGroundSchema } from "genshin-world";

// Windrise's base as the lock holds it, each record read from the dev account and checked against its schema, through
// The selection the world reads its base by: the record alone, or its quarters
export const readWorldBaseGrounds = (lockKeys: readonly string[]): Promise<[RegionGround, ...RegionGround[]]> =>
  readWindriseBaseGrounds(lockKeys, async (key) => regionGroundSchema.parse(await readPublishedGameData(key)));
