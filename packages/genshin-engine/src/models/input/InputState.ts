import type { InputAction } from "#src/models/input/InputAction";

// What the player asked for this frame: a move, each axis from -1 to 1, forward and right over the ground and up over
// It, a look turn in radians since the last frame's read, the wheel's notches since that read, away from the view
// Positive, the actions whose chord is held, and those whose chord was pressed since that read
// The gamepad's directional pad and left stick as a menu's direction, each from -1 to 1, right and down positive, and
// The bumpers' presses since that read as the tabs a menu steps, the right bumper one forward and the left one back
export interface InputState {
  heldActions: ReadonlySet<InputAction>;
  lookPitch: number;
  lookYaw: number;
  menuDown: number;
  menuRight: number;
  menuTabSteps: number;
  moveForward: number;
  moveRight: number;
  moveUp: number;
  pressedActions: ReadonlySet<InputAction>;
  zoomSteps: number;
}
