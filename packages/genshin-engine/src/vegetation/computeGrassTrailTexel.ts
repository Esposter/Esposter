import { GRASS_TRAIL_TEXELS } from "#src/vegetation/constants";

// The texel a world cell's coordinate lands on along one axis: the square wraps, so every cell a texel holds is the one
// that is a whole number of squares off it
export const computeGrassTrailTexel = (cell: number): number =>
  ((cell % GRASS_TRAIL_TEXELS) + GRASS_TRAIL_TEXELS) % GRASS_TRAIL_TEXELS;
