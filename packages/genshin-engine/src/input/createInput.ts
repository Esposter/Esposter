import type { Input } from "#src/models/input/Input";
import type { InputAction } from "#src/models/input/InputAction";
import type { InputState } from "#src/models/input/InputState";

import {
  FIELD_SELECTOR,
  FOCUS_KEY_CODES,
  GAMEPAD_BUTTONS,
  GAMEPAD_LOOK_RADIANS_PER_SECOND,
  GAMEPAD_STICK_DEADZONE,
  KEY_CODE_BACKWARD,
  KEY_CODE_DOWN,
  KEY_CODE_FORWARD,
  KEY_CODE_LEFT,
  KEY_CODE_RIGHT,
  KEY_CODE_UP,
  MOUSE_BUTTONS,
  MOUSE_LOOK_RADIANS_PER_PIXEL,
} from "#src/input/constants";
import { InputActionBindingMap } from "#src/input/InputActionBindingMap";
import { InputActions } from "#src/models/input/InputAction";

const toAxis = (positive: boolean, negative: boolean): number => Number(positive) - Number(negative);

const toDeadzoned = (stickAxis: number): number => (Math.abs(stickAxis) < GAMEPAD_STICK_DEADZONE ? 0 : stickAxis);

// The keys and mouse buttons held, the pointer's movement while it is locked, and the first gamepad's sticks and
// Buttons, all read through the window handed in, once a frame. The look is what the pointer moved since the last read,
// The zoom the wheel's notches since then, and the move is the keys and the stick combined, a pair of opposite keys
// Cancelling. An action is held while every code of one of its chords is, and pressed when a chord's last code was
// Pressed since the last read with the rest held, the longest chord pressed by a code winning, so a gamepad's bumper and
// A face button are the bumper's shortcut alone. A bound key's browser default is prevented, but for the keys focus
// Moves with, and a key typed into a field is the field's. A window that loses focus hears no key's release, so a blur
// Lets go of every key. The touch controls drawn over the world press a code through its on-screen button, push an
// On-screen stick read with the gamepad's, and turn the look as a drag across the screen does
export const createInput = (target: Window): Input => {
  const controller = new AbortController();
  const { signal } = controller;
  const heldCodes = new Set<string>();
  const pressedCodes = new Set<string>();
  const boundCodes = new Set(InputActions.flatMap((action) => InputActionBindingMap[action].flat()));
  // The length of the longest chord a code pressed since the last read triggers
  const codeChordLengthMap = new Map<string, number>();
  let pendingLookYaw = 0;
  let pendingLookPitch = 0;
  let pendingZoomSteps = 0;
  // The touch controls' on-screen stick, read with the gamepad's left stick
  let touchStickX = 0;
  let touchStickY = 0;
  const heldActions = new Set<InputAction>();
  const pressedActions = new Set<InputAction>();
  const inputState: InputState = {
    heldActions,
    lookPitch: 0,
    lookYaw: 0,
    moveForward: 0,
    moveRight: 0,
    moveUp: 0,
    pressedActions,
    zoomSteps: 0,
  };
  const press = (code: string) => {
    if (!heldCodes.has(code)) pressedCodes.add(code);
    heldCodes.add(code);
  };
  // Whether the chord's last code was pressed since the last read with every other one held
  const checkIsChordTriggered = (chord: readonly string[]): boolean =>
    chord.every((code, index) => (index === chord.length - 1 ? pressedCodes.has(code) : heldCodes.has(code)));
  target.addEventListener(
    "keydown",
    (event) => {
      if (target.document.activeElement?.matches(FIELD_SELECTOR)) return;
      if (boundCodes.has(event.code) && !FOCUS_KEY_CODES.includes(event.code)) event.preventDefault();
      press(event.code);
    },
    { signal },
  );
  target.addEventListener(
    "keyup",
    (event) => {
      heldCodes.delete(event.code);
    },
    { signal },
  );
  target.addEventListener(
    "mousedown",
    (event) => {
      const button = MOUSE_BUTTONS[event.button];
      if (button) press(button);
    },
    { signal },
  );
  target.addEventListener(
    "mouseup",
    (event) => {
      const button = MOUSE_BUTTONS[event.button];
      if (button) heldCodes.delete(button);
    },
    { signal },
  );
  target.addEventListener(
    "blur",
    () => {
      heldCodes.clear();
    },
    { signal },
  );
  target.addEventListener(
    "mousemove",
    (event) => {
      if (target.document.pointerLockElement === null) return;
      pendingLookYaw -= event.movementX * MOUSE_LOOK_RADIANS_PER_PIXEL;
      pendingLookPitch -= event.movementY * MOUSE_LOOK_RADIANS_PER_PIXEL;
    },
    { signal },
  );
  target.addEventListener(
    "wheel",
    (event) => {
      pendingZoomSteps += Math.sign(event.deltaY);
    },
    { signal },
  );
  return {
    dispose: () => {
      controller.abort();
    },
    press,
    readInput: (frameSeconds) => {
      const gamepad = target.navigator.getGamepads().find((candidate): candidate is Gamepad => candidate !== null);
      const [stickX = 0, stickY = 0, lookStickX = 0, lookStickY = 0] = gamepad?.axes ?? [];
      for (const [index, button] of GAMEPAD_BUTTONS.entries())
        if (gamepad?.buttons[index]?.pressed) press(button);
        else heldCodes.delete(button);

      inputState.lookYaw = pendingLookYaw - toDeadzoned(lookStickX) * GAMEPAD_LOOK_RADIANS_PER_SECOND * frameSeconds;
      inputState.lookPitch =
        pendingLookPitch - toDeadzoned(lookStickY) * GAMEPAD_LOOK_RADIANS_PER_SECOND * frameSeconds;
      inputState.zoomSteps = pendingZoomSteps;
      pendingLookYaw = 0;
      pendingLookPitch = 0;
      pendingZoomSteps = 0;
      inputState.moveForward = Math.max(
        -1,
        Math.min(
          1,
          toAxis(heldCodes.has(KEY_CODE_FORWARD), heldCodes.has(KEY_CODE_BACKWARD)) - toDeadzoned(stickY) - touchStickY,
        ),
      );
      inputState.moveRight = Math.max(
        -1,
        Math.min(
          1,
          toAxis(heldCodes.has(KEY_CODE_RIGHT), heldCodes.has(KEY_CODE_LEFT)) + toDeadzoned(stickX) + touchStickX,
        ),
      );
      inputState.moveUp = toAxis(heldCodes.has(KEY_CODE_UP), heldCodes.has(KEY_CODE_DOWN));
      codeChordLengthMap.clear();
      for (const action of InputActions)
        for (const chord of InputActionBindingMap[action]) {
          const lastCode = chord.at(-1);
          if (lastCode !== undefined && checkIsChordTriggered(chord))
            codeChordLengthMap.set(lastCode, Math.max(codeChordLengthMap.get(lastCode) ?? 0, chord.length));
        }
      heldActions.clear();
      pressedActions.clear();
      for (const action of InputActions)
        for (const chord of InputActionBindingMap[action]) {
          const lastCode = chord.at(-1);
          if (chord.every((code) => heldCodes.has(code))) heldActions.add(action);
          if (
            lastCode !== undefined &&
            checkIsChordTriggered(chord) &&
            chord.length === codeChordLengthMap.get(lastCode)
          )
            pressedActions.add(action);
        }
      pressedCodes.clear();
      return inputState;
    },
    release: (code) => {
      heldCodes.delete(code);
    },
    setTouchStick: (x, y) => {
      touchStickX = x;
      touchStickY = y;
    },
    turn: (lookYaw, lookPitch) => {
      pendingLookYaw += lookYaw;
      pendingLookPitch += lookPitch;
    },
  };
};
