import type { InputAction } from "#src/models/input/InputAction";

// What the player asked for this frame: a move, each axis from -1 to 1, forward and right over the ground and up over
// It, a look turn in radians since the last frame's read, the actions whose chord is held, and those whose chord was
// Pressed since that read
export interface InputState {
  heldActions: ReadonlySet<InputAction>;
  lookPitch: number;
  lookYaw: number;
  moveForward: number;
  moveRight: number;
  moveUp: number;
  pressedActions: ReadonlySet<InputAction>;
}
