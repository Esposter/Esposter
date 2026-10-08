import type { InputAction } from "#src/models/input/InputAction";

// What the player asks of the body at a step: the move, each axis from -1 to 1 relative to the camera, whether it walks
// And whether sprint is held, and the actions pressed since the last step read them
export interface LocomotionInput {
  isSprintHeld: boolean;
  isWalking: boolean;
  moveForward: number;
  moveRight: number;
  pressedActions: ReadonlySet<InputAction>;
}
