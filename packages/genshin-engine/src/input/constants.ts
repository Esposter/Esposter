import { GamepadButton } from "#src/models/input/GamepadButton";
import { MouseButton } from "#src/models/input/MouseButton";

// The keys a free camera reads, by their physical code so a layout does not move them
export const KEY_CODE_FORWARD = "KeyW";
export const KEY_CODE_BACKWARD = "KeyS";
export const KEY_CODE_LEFT = "KeyA";
export const KEY_CODE_RIGHT = "KeyD";
export const KEY_CODE_UP = "Space";
export const KEY_CODE_DOWN = "ShiftLeft";
// The keys a page's focus moves and presses with, whose default stays the browser's even where a binding takes them,
// So a screen's controls work from the keyboard
export const FOCUS_KEY_CODES: readonly string[] = ["Enter", "Space", "Tab"];
// What a key is typed into, whose keys are its own and reach no binding
export const FIELD_SELECTOR = 'input, select, textarea, [contenteditable="true"]';
// A gamepad's buttons in the order the standard layout's `buttons` holds them
export const GAMEPAD_BUTTONS: readonly GamepadButton[] = [
  GamepadButton.FaceBottom,
  GamepadButton.FaceRight,
  GamepadButton.FaceLeft,
  GamepadButton.FaceTop,
  GamepadButton.LeftBumper,
  GamepadButton.RightBumper,
  GamepadButton.LeftTrigger,
  GamepadButton.RightTrigger,
  GamepadButton.Back,
  GamepadButton.Start,
  GamepadButton.LeftStick,
  GamepadButton.RightStick,
  GamepadButton.DirectionalPadUp,
  GamepadButton.DirectionalPadDown,
  GamepadButton.DirectionalPadLeft,
  GamepadButton.DirectionalPadRight,
];
// A mouse's buttons in the order a mouse event numbers them
export const MOUSE_BUTTONS: readonly MouseButton[] = [
  MouseButton.Primary,
  MouseButton.Auxiliary,
  MouseButton.Secondary,
];
// The radians a pixel of pointer movement turns the look by
export const MOUSE_LOOK_RADIANS_PER_PIXEL = 0.002;
// The radians a second a gamepad's right stick held past its deadzone turns the look by
export const GAMEPAD_LOOK_RADIANS_PER_SECOND = 2.5;
// The fraction of a gamepad stick's travel read as no movement at all, so a resting stick holds still
export const GAMEPAD_STICK_DEADZONE = 0.15;
