import type { InputState } from "#src/models/input/InputState";
import type { Vector3 } from "three";

// A camera behind a body: a frame's look turns its yaw, tilts its pitch and zooms it once, a reset puts it behind the
// Way the body faces, and a follow stands its eye on the arm out from the pivot, in the world's coordinates, placing the
// Camera in the scene's by the origin. A body's steps read its yaw
export interface FollowCamera {
  follow: (pivot: Vector3, origin: Vector3, frameSeconds: number) => void;
  look: (input: InputState, facing: number) => void;
  readonly yaw: number;
}
