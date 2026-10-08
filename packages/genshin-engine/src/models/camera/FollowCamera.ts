import type { InputState } from "#src/models/input/InputState";
import type { Vector3 } from "three";

// A camera behind a body: a frame's look turns its yaw, tilts its pitch and zooms it once, a reset, pressed or after a
// Jump, puts it level behind the way the body faces at its default distance, and a follow stands its eye on the arm out
// From the pivot, in the world's coordinates, placing the camera in the scene's by the origin. A body's steps read its
// Yaw
export interface FollowCamera {
  follow: (pivot: Vector3, origin: Vector3, frameSeconds: number) => void;
  look: (input: InputState, facing: number) => void;
  reset: (facing: number) => void;
  readonly yaw: number;
}
