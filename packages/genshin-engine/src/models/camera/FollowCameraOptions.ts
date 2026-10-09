import type { FollowCameraSettings } from "#src/models/camera/FollowCameraSettings";
import type { GroundQuery } from "#src/models/collision/GroundQuery";
import type { LandmarkCollider } from "#src/models/collision/LandmarkCollider";
import type { PerspectiveCamera } from "three";

// The camera a follow camera moves, the ground and landmarks that pull it in, read in the world's own coordinates, and
// The settings its look and reset read on every call
export interface FollowCameraOptions {
  camera: PerspectiveCamera;
  ground: GroundQuery;
  landmarkCollider: LandmarkCollider;
  settings: FollowCameraSettings;
}
