import type { Input } from "#src/models/input/Input";
import type { InputState } from "#src/models/input/InputState";

import {
  GAMEPAD_LOOK_RADIANS_PER_SECOND,
  GAMEPAD_STICK_DEADZONE,
  KEY_CODE_BACKWARD,
  KEY_CODE_DOWN,
  KEY_CODE_FORWARD,
  KEY_CODE_LEFT,
  KEY_CODE_RIGHT,
  KEY_CODE_UP,
  MOUSE_LOOK_RADIANS_PER_PIXEL,
} from "#src/input/constants";

const toAxis = (positive: boolean, negative: boolean): number => Number(positive) - Number(negative);

const toDeadzoned = (stickAxis: number): number => (Math.abs(stickAxis) < GAMEPAD_STICK_DEADZONE ? 0 : stickAxis);

// The keys held, the pointer's movement while it is locked, and the first gamepad's left stick, all read through the
// Window handed in, once a frame. The look is what the pointer moved since the last read, and the move is the keys
// And the stick combined, a pair of opposite keys cancelling. A window that loses focus hears no key's release, so a
// Blur lets go of every key. The touch controls drawn over the world hold a key through its on-screen button, push an
// On-screen stick read with the gamepad's, and turn the look as a drag across the screen does
export const createInput = (target: Window): Input => {
  const controller = new AbortController();
  const { signal } = controller;
  const pressedCodes = new Set<string>();
  let pendingLookYaw = 0;
  let pendingLookPitch = 0;
  let touchStickX = 0;
  let touchStickY = 0;
  const inputState: InputState = { lookPitch: 0, lookYaw: 0, moveForward: 0, moveRight: 0, moveUp: 0 };
  const checkIsPressed = (code: string): boolean => pressedCodes.has(code);
  target.addEventListener(
    "keydown",
    (event) => {
      pressedCodes.add(event.code);
    },
    { signal },
  );
  target.addEventListener(
    "keyup",
    (event) => {
      pressedCodes.delete(event.code);
    },
    { signal },
  );
  target.addEventListener(
    "blur",
    () => {
      pressedCodes.clear();
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
  return {
    dispose: () => {
      controller.abort();
    },
    press: (code) => {
      pressedCodes.add(code);
    },
    readInput: (frameSeconds) => {
      const gamepad = target.navigator.getGamepads().find((candidate): candidate is Gamepad => candidate !== null);
      const [stickX = 0, stickY = 0, lookStickX = 0, lookStickY = 0] = gamepad?.axes ?? [];
      inputState.lookYaw = pendingLookYaw - toDeadzoned(lookStickX) * GAMEPAD_LOOK_RADIANS_PER_SECOND * frameSeconds;
      inputState.lookPitch =
        pendingLookPitch - toDeadzoned(lookStickY) * GAMEPAD_LOOK_RADIANS_PER_SECOND * frameSeconds;
      pendingLookYaw = 0;
      pendingLookPitch = 0;
      inputState.moveForward = Math.max(
        -1,
        Math.min(
          1,
          toAxis(checkIsPressed(KEY_CODE_FORWARD), checkIsPressed(KEY_CODE_BACKWARD)) -
            toDeadzoned(stickY) -
            touchStickY,
        ),
      );
      inputState.moveRight = Math.max(
        -1,
        Math.min(
          1,
          toAxis(checkIsPressed(KEY_CODE_RIGHT), checkIsPressed(KEY_CODE_LEFT)) + toDeadzoned(stickX) + touchStickX,
        ),
      );
      inputState.moveUp = toAxis(checkIsPressed(KEY_CODE_UP), checkIsPressed(KEY_CODE_DOWN));
      return inputState;
    },
    release: (code) => {
      pressedCodes.delete(code);
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
