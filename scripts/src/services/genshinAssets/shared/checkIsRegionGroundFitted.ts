import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { GameDataset } from "genshin-world";

// Whether a fit has drawn a region's ground: a piece of it is in the lock, where one no fit has drawn is the plateau its
// Authored file holds under the region's own key
export const checkIsRegionGroundFitted = async (region: string): Promise<boolean> =>
  Object.keys((await readGameDataLock()).objects).some((key) => key.startsWith(`${GameDataset.Ground}/${region}/`));
