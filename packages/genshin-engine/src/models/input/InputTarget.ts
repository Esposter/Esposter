import type { InputGamepad } from "#src/models/input/InputGamepad";

// The parts of the window the input reads: its listeners, the element holding its pointer lock, and its gamepads
export interface InputTarget extends Pick<Window, "addEventListener"> {
  document: { pointerLockElement: null | object };
  navigator: { getGamepads: () => (InputGamepad | null)[] };
}
