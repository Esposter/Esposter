import type { GroundSample } from "#src/models/collision/GroundSample";

// The world's answers to where a moving thing may stand: the ground at a point, and the water's surface
export interface GroundQuery {
  getGround: (x: number, z: number) => GroundSample;
  getWaterLevel: () => number;
}
