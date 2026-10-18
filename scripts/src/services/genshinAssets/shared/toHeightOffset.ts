import type { GroundPoint } from "genshin-engine";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";

// A landmark's height over the world's ground at its place in the region's axes: the game's height less the origin's and
// The ground's, rounded as every fitted number is
export const toHeightOffset = (
  height: number,
  originY: number,
  { x, z }: GroundPoint,
  getWorldHeight: (x: number, z: number) => number,
): number => roundFitted(height - originY - getWorldHeight(x, z));
