import type { InputState } from "#src/models/input/InputState";
import type { Vector3 } from "three";

// A camera the player flies, turned by a frame's look once a frame and moved by its input once per fixed step. A place
// Stands it at a position in the scene and faces it by a yaw and a pitch in radians, as a jump does
export interface FreeCamera {
  look: (input: InputState) => void;
  place: (position: Vector3, yaw: number, pitch: number) => void;
  step: (input: InputState, stepSeconds: number) => void;
}
