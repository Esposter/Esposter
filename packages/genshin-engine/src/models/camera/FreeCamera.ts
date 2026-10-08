import type { InputState } from "#src/models/input/InputState";

// A camera the player flies, moved by one input per fixed step
export interface FreeCamera {
  step: (input: InputState, stepSeconds: number) => void;
}
