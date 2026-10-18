import type { GroundPoint } from "genshin-engine";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { ROTATION_DECIMALS } from "#src/services/genshinAssets/shared/constants";
import { MathUtils } from "three";

// Where a game place stands in a region's axes round the origin's place, as a region's other places do: its x less the
// Origin's, its z the origin's less the game's, and its turn about the vertical in degrees reversed, wrapped to a half-turn
// Either way. A place with no turn faces zero, not a negative zero
export const toRegionAxesPlace = (
  position: GroundPoint,
  turnDegrees: number,
  [originX, , originZ]: readonly [number, number, number],
): { position: GroundPoint; rotation: number } => {
  const radians = MathUtils.degToRad(turnDegrees);
  const turn = Math.atan2(Math.sin(radians), Math.cos(radians));
  return {
    position: { x: roundFitted(position.x - originX), z: roundFitted(originZ - position.z) },
    rotation: Math.round(-turn * ROTATION_DECIMALS) / ROTATION_DECIMALS || 0,
  };
};
