import type { InputGamepad } from "#src/models/input/InputGamepad";

// The window the input reads, with each read of it handed in by the caller, so the engine reads no DOM: its listeners,
// Whether a key sent from an event target was typed into a field, whether the pointer is locked, and its gamepads
export interface InputTarget extends Pick<Window, "addEventListener"> {
  // Whether a key was typed into a field, its event target being that field. A key a command dispatches on the window
  // Comes from the window, which is no field, so it is the game's whatever field has the focus
  checkIsFieldTarget: (eventTarget: EventTarget | null) => boolean;
  checkIsPointerLocked: () => boolean;
  getGamepads: () => (InputGamepad | null)[];
}
