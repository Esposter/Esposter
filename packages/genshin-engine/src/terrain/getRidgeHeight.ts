import type { RidgeFeature } from "#src/models/terrain/RidgeFeature";

import { measureSegment } from "#src/terrain/measureSegment";

// A ridge's Gaussian profile over the distance from its segment, the hypotenuse of the across and beyond measures
export const getRidgeHeight = (feature: RidgeFeature, x: number, z: number): number => {
  const measurement = measureSegment(feature, x, z);
  const across = measurement[0] ?? 0;
  const beyond = measurement[1] ?? 0;
  const { height, width } = feature;
  return height * Math.exp(-(across ** 2 + beyond ** 2) / (2 * width * width));
};
