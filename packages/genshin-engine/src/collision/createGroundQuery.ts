import type { GroundQuery } from "#src/models/collision/GroundQuery";

import { GROUND_NORMAL_SPAN } from "#src/collision/constants";
import { Vector3 } from "three";

// The ground's height and normal at a point, from the same height function the terrain is built from, and the water's
// Surface. The sample is one object reused by every query, so a frame reads the ground allocating nothing
export const createGroundQuery = (getHeight: (x: number, z: number) => number, waterLevel: number): GroundQuery => {
  const normal = new Vector3();
  const sample = { height: 0, normal };
  const halfSpan = GROUND_NORMAL_SPAN / 2;
  return {
    getGround: (x, z) => {
      const slopeX = (getHeight(x + halfSpan, z) - getHeight(x - halfSpan, z)) / GROUND_NORMAL_SPAN;
      const slopeZ = (getHeight(x, z + halfSpan) - getHeight(x, z - halfSpan)) / GROUND_NORMAL_SPAN;
      sample.height = getHeight(x, z);
      normal.set(-slopeX, 1, -slopeZ).normalize();
      return sample;
    },
    getWaterLevel: () => waterLevel,
  };
};
