import type { BufferGeometry } from "three";

// One piece of the walkway: the depth of its middle, which it rises into place by as one, its geometry, and a share from
// 0 to 1 staggering its rise from its neighbours'
export interface LoginWalkwayPiece {
  depth: number;
  geometry: BufferGeometry;
  seed: number;
}
