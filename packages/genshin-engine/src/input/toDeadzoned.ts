import { GAMEPAD_STICK_DEADZONE } from "#src/input/constants";

export const toDeadzoned = (stickAxis: number): number =>
  Math.abs(stickAxis) < GAMEPAD_STICK_DEADZONE ? 0 : stickAxis;
