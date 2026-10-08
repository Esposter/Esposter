import type { GroundQuery } from "#src/models/collision/GroundQuery";
import type { LandmarkCollider } from "#src/models/collision/LandmarkCollider";
import type { PerspectiveCamera } from "three";

// The camera a follow camera moves, and the ground and landmarks that pull it in, read in the world's own coordinates
export interface FollowCameraOptions {
  camera: PerspectiveCamera;
  ground: GroundQuery;
  landmarkCollider: LandmarkCollider;
}
