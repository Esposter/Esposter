import type { GroundPoint } from "genshin-engine";

// A point of the map matched to a point of the scene, with each one's index in its set and the distance between them
// Once the transform that matched them carries the map's point over
export interface SimilarityPair {
  distance: number;
  from: GroundPoint;
  fromIndex: number;
  to: GroundPoint;
  toIndex: number;
}
