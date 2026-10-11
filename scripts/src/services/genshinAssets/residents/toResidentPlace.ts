import type { ResidentPlacement } from "#src/models/genshinAssets/residents/ResidentPlacement";
import type { SceneGroupPlace } from "genshin-world";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { ROTATION_DECIMALS } from "#src/services/genshinAssets/shared/constants";
import { MathUtils } from "three";

// Where an NPC the scene group record places stands in a region's axes round the origin's place, the way a region's
// Other places do: x less the origin's x, z the origin's less the game's, and the turn about the vertical reversed. A
// Place with no turn faces zero, not a negative zero
export const toResidentPlace = (
  npcId: number,
  { position, rotationY = 0 }: SceneGroupPlace,
  region: string,
  [originX, , originZ]: readonly [number, number, number],
): ResidentPlacement => {
  const radians = MathUtils.degToRad(rotationY);
  const turn = Math.atan2(Math.sin(radians), Math.cos(radians));
  return {
    npcId,
    position: { x: roundFitted(position.x - originX), z: roundFitted(originZ - position.z) },
    region,
    rotation: Math.round(-turn * ROTATION_DECIMALS) / ROTATION_DECIMALS || 0,
  };
};
