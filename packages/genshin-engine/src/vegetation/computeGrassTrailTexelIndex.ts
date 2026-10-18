import { computeGrassTrailTexel } from "#src/vegetation/computeGrassTrailTexel";
import { GRASS_TRAIL_TEXELS } from "#src/vegetation/constants";

// The index of the texel a world cell lands on, the texels laid out row by row
export const computeGrassTrailTexelIndex = (cellX: number, cellZ: number): number =>
  computeGrassTrailTexel(cellZ) * GRASS_TRAIL_TEXELS + computeGrassTrailTexel(cellX);
