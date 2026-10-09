import type { DumpedNpcBorn } from "#src/models/genshinAssets/residents/DumpedNpcBorn";
import type { ResidentPlacement } from "#src/models/genshinAssets/residents/ResidentPlacement";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { ROTATION_DECIMALS } from "#src/services/genshinAssets/shared/constants";
import { MathUtils } from "three";

// Where a birth record stands in a region's axes round the origin's place, the way a region's other places do: x less
// The origin's x, z the origin's less the game's, and the turn about the vertical reversed. A record with no turn faces
// Zero, not a negative zero
export const toResidentPlace = (
  { _configId, _pos, _rot = {} }: DumpedNpcBorn,
  region: string,
  [originX, , originZ]: readonly [number, number, number],
): ResidentPlacement => {
  const radians = MathUtils.degToRad(_rot.y ?? 0);
  const turn = Math.atan2(Math.sin(radians), Math.cos(radians));
  return {
    npcId: _configId,
    position: { x: roundFitted(_pos.x - originX), z: roundFitted(originZ - _pos.z) },
    region,
    rotation: Math.round(-turn * ROTATION_DECIMALS) / ROTATION_DECIMALS || 0,
  };
};
