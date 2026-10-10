import type { RidgeFeature } from "#src/models/terrain/RidgeFeature";

import { measureSegment } from "#src/terrain/measureSegment";

// The share of a ridge's height at a point: its Gaussian profile over the distance from its segment, the hypotenuse of
// The across and beyond measures
export const getRidgeBlend = (feature: RidgeFeature, x: number, z: number): number => {
  const measurement = measureSegment(feature, x, z);
  const across = measurement[0] ?? 0;
  const beyond = measurement[1] ?? 0;
  const { width } = feature;
  return Math.exp(-(across ** 2 + beyond ** 2) / (2 * width * width));
};
