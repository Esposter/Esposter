import type { Vector } from "#src/models/shared/Vector";

import { getGaussian } from "#src/services/genshinParity/shared/getGaussian";
import { getGaussianSqrt } from "#src/services/genshinParity/shared/getGaussianSqrt";

const GAUSSIAN_A1: Vector = [1, 1, 34.1];
const GAUSSIAN_B1: Vector = [0.0047, 0.0053, 0.04];
const GAUSSIAN_A2: Vector = [0, 0, 13.5];
const GAUSSIAN_B2: Vector = [1e-5, 1e-5, 0.025];

// The contrast sensitivity filters, separated: one for the achromatic and red-green channels, and the blue-yellow's sum
// Of two Gaussians as two filters whose squares sum to it
export const createSpatialFilters = (pixelsPerDegree: number): { cz: [number, number][]; ycx: [number, number][] } => {
  const largest = Math.max(...GAUSSIAN_B1, GAUSSIAN_B2[0], GAUSSIAN_B2[1], GAUSSIAN_B2[2]);
  const radius = Math.ceil(3 * Math.sqrt(largest / (2 * Math.PI * Math.PI)) * pixelsPerDegree);
  const ycx: [number, number][] = [];
  const cz: [number, number][] = [];
  for (let offset = -radius; offset <= radius; offset++) {
    const x2 = (offset / pixelsPerDegree) ** 2;
    ycx.push([getGaussian(x2, GAUSSIAN_A1[0], GAUSSIAN_B1[0]), getGaussian(x2, GAUSSIAN_A1[1], GAUSSIAN_B1[1])]);
    cz.push([getGaussianSqrt(x2, GAUSSIAN_A1[2], GAUSSIAN_B1[2]), getGaussianSqrt(x2, GAUSSIAN_A2[2], GAUSSIAN_B2[2])]);
  }
  const [sumY, sumCx] = ycx.reduce(([y, x], [wy, wx]) => [y + wy, x + wx], [0, 0]);
  const [sumCz1, sumCz2] = cz.reduce(([first, second], [w1, w2]) => [first + w1, second + w2], [0, 0]);
  const czNorm = 1 / Math.hypot(sumCz1, sumCz2);
  return { cz: cz.map(([w1, w2]) => [w1 * czNorm, w2 * czNorm]), ycx: ycx.map(([wy, wx]) => [wy / sumY, wx / sumCx]) };
};
