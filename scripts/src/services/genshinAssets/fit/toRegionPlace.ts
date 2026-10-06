import type { WorldPrefabPlacements } from "#src/models/genshinAssets/world/WorldPrefabPlacements";
import type { GroundPoint } from "genshin-engine";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { ROTATION_DECIMALS, UNITY_EULER_ORDER } from "#src/services/genshinAssets/shared/constants";
import { Euler, Quaternion } from "three";

// Where a place the world sets a prefab down stands in our region's axes round the origin's place: three's, x as the
// Game's and z its mirror, and its turn about the vertical in radians, which the mirror reverses
export const toRegionPlace = (
  { position: [x, , z], rotation }: Pick<WorldPrefabPlacements["places"][number], "position" | "rotation">,
  [originX, , originZ]: readonly [number, number, number],
): { position: GroundPoint; rotation: number } => {
  const { y: turn } = new Euler().setFromQuaternion(new Quaternion(...rotation), UNITY_EULER_ORDER);
  return {
    position: { x: roundFitted(x - originX), z: roundFitted(originZ - z) },
    rotation: Math.round(-turn * ROTATION_DECIMALS) / ROTATION_DECIMALS,
  };
};
