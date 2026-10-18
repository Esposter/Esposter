import type { SceneTransportPoint } from "#src/models/genshinAssets/world/SceneTransportPoint";
import type { LandmarkArrival } from "genshin-world";

import { toHeightOffset } from "#src/services/genshinAssets/shared/toHeightOffset";
import { toRegionAxesPlace } from "#src/services/genshinAssets/shared/toRegionAxesPlace";

// A transport point as the arrival of a landmark a jump goes to: its place and turn carried into the region's axes round
// The origin as every other place is, and its height over the world's ground at that place
export const toLandmarkArrival = (
  { height, position, turnDegrees }: SceneTransportPoint,
  origin: readonly [number, number, number],
  getWorldHeight: (x: number, z: number) => number,
): LandmarkArrival => {
  const [, originY] = origin;
  const { position: regionPosition, rotation } = toRegionAxesPlace(position, turnDegrees, origin);
  return {
    heightOffset: toHeightOffset(height, originY, regionPosition, getWorldHeight),
    position: regionPosition,
    rotation,
  };
};
