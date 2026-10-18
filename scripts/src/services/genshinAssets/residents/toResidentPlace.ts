import type { ResidentPlacement } from "#src/models/genshinAssets/residents/ResidentPlacement";
import type { SceneGroupPlace } from "genshin-world";

import { toRegionAxesPlace } from "#src/services/genshinAssets/shared/toRegionAxesPlace";

// Where an NPC the scene group record places stands in a region's axes round the origin's place, filed under its region
export const toResidentPlace = (
  npcId: number,
  { position, rotationY = 0 }: SceneGroupPlace,
  region: string,
  origin: readonly [number, number, number],
): ResidentPlacement => ({ npcId, region, ...toRegionAxesPlace(position, rotationY, origin) });
