// The keys a free camera reads, by their physical code so a layout does not move them
export const KEY_CODE_FORWARD = "KeyW";
export const KEY_CODE_BACKWARD = "KeyS";
export const KEY_CODE_LEFT = "KeyA";
export const KEY_CODE_RIGHT = "KeyD";
export const KEY_CODE_UP = "Space";
export const KEY_CODE_DOWN = "ShiftLeft";
// The radians a pixel of pointer movement turns the look by
export const MOUSE_LOOK_RADIANS_PER_PIXEL = 0.002;
// The radians a second a gamepad's right stick held past its deadzone turns the look by
export const GAMEPAD_LOOK_RADIANS_PER_SECOND = 2.5;
// The fraction of a gamepad stick's travel read as no movement at all, so a resting stick holds still
export const GAMEPAD_STICK_DEADZONE = 0.15;
