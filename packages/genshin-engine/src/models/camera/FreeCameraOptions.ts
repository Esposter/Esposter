import type { GroundQuery } from "#src/models/collision/GroundQuery";
import type { PerspectiveCamera } from "three";

// The camera a free camera moves, and the ground it is held above
export interface FreeCameraOptions {
  camera: PerspectiveCamera;
  ground: GroundQuery;
}
