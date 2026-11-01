import type { InputState } from "#src/models/input/InputState";

// The state of an input holding nothing: every number zero and every set empty. Each call returns a fresh one, because
// The sets are mutable, and a state shared between callers would carry one caller's presses into another's
export const createIdleInputState = (): InputState => ({
  heldActions: new Set(),
  lookPitch: 0,
  lookYaw: 0,
  menuDown: 0,
  menuRight: 0,
  menuTabSteps: 0,
  moveForward: 0,
  moveRight: 0,
  moveUp: 0,
  pressedActions: new Set(),
  zoomSteps: 0,
});
