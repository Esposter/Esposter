import type { CliffFeature } from "#src/models/terrain/CliffFeature";
import type { RidgeFeature } from "#src/models/terrain/RidgeFeature";

// Written by every measurement, read straight after it, so a point's measure allocates nothing
const measurement = new Float64Array(2);

// Measures a point against a segment into the shared buffer: its signed distance across the segment's line, positive to
// the left of its direction, and its distance beyond the segment's ends along the line, zero within them
export const measureSegment = (
  { endX, endZ, startX, startZ }: CliffFeature | RidgeFeature,
  x: number,
  z: number,
): Float64Array => {
  const directionX = endX - startX;
  const directionZ = endZ - startZ;
  const length = Math.hypot(directionX, directionZ);
  const offsetX = x - startX;
  const offsetZ = z - startZ;
  const along = (offsetX * directionX + offsetZ * directionZ) / length;
  measurement[0] = (directionX * offsetZ - directionZ * offsetX) / length;
  measurement[1] = Math.max(0, -along, along - length);
  return measurement;
};
