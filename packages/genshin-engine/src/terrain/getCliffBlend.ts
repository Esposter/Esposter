import type { CliffFeature } from "#src/models/terrain/CliffFeature";

import { measureSegment } from "#src/terrain/measureSegment";
import { MathUtils } from "three";

// The share of a cliff's height at a point: its terrace raised across the line up to its width, each edge blended
// Across the falloff, and faded past the segment's ends over the same falloff
export const getCliffBlend = (feature: CliffFeature, x: number, z: number): number => {
  const measurement = measureSegment(feature, x, z);
  const across = measurement[0] ?? 0;
  const beyond = measurement[1] ?? 0;
  const { falloff, width } = feature;
  return (
    MathUtils.smoothstep(across, -falloff, falloff) *
    (1 - MathUtils.smoothstep(across, width, width + falloff)) *
    (1 - MathUtils.smoothstep(beyond, 0, falloff))
  );
};
