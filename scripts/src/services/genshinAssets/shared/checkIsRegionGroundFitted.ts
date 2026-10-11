import type { RegionGround } from "genshin-world";

import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { readPublishedGameDataObject } from "#src/services/gameData/readPublishedGameDataObject";
import { GameDataset } from "genshin-world";

// Whether a fit has drawn a region's ground: its published record holds hills, where one no fit has drawn holds only the
// Plateaus its places stand on, as its authored file does
export const checkIsRegionGroundFitted = async (region: string): Promise<boolean> => {
  const hash = (await readGameDataLock()).objects[`${GameDataset.Ground}/${region}`];
  if (hash === undefined) return false;
  const { hills } = await readPublishedGameDataObject<RegionGround>(hash);
  return hills.length > 0;
};
