// The parts of a gamepad the input reads: its stick axes, and whether each button is pressed
export interface InputGamepad {
  axes: readonly number[];
  buttons: readonly { pressed: boolean }[];
}
