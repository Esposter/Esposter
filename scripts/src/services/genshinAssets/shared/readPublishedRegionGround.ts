import type { RegionGround } from "genshin-world";

import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { regionGroundSchema } from "genshin-world";

// One region's ground as the game data publishes it under its key, checked against its schema
export const readPublishedRegionGround = async (key: string): Promise<RegionGround> =>
  regionGroundSchema.parse(await readPublishedGameData(key));
