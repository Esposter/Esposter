import type { InputGamepad } from "#src/models/input/InputGamepad";

// The parts of the window the input reads: its listeners, what holds its focus and its pointer lock, and its gamepads
export interface InputTarget extends Pick<Window, "addEventListener"> {
  document: { activeElement: null | { matches: (selectors: string) => boolean }; pointerLockElement: null | object };
  navigator: { getGamepads: () => (InputGamepad | null)[] };
}
