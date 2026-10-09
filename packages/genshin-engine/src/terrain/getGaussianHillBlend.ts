import type { GaussianHill } from "#src/models/terrain/GaussianHill";

import { GAUSSIAN_REACH_WIDTHS } from "#src/terrain/constants";

// The share of a hill's height at a point: its Gaussian over the distance from its centre, cut to none past its reach
// Along either axis, the square a fit reads the hill over, so the ground draws each hill as it was fitted
export const getGaussianHillBlend = (
  { width, x: hillX, z: hillZ }: Pick<GaussianHill, "width" | "x" | "z">,
  x: number,
  z: number,
): number => {
  const reach = GAUSSIAN_REACH_WIDTHS * width;
  const acrossX = x - hillX;
  const acrossZ = z - hillZ;
  if (Math.abs(acrossX) > reach || Math.abs(acrossZ) > reach) return 0;
  return Math.exp(-(acrossX ** 2 + acrossZ ** 2) / (2 * width * width));
};
