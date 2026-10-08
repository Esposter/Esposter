import {
  GAMEPAD_STICK_DEADZONE,
  KEY_CODE_BACKWARD,
  KEY_CODE_FORWARD,
  KEY_CODE_RIGHT,
  MOUSE_LOOK_RADIANS_PER_PIXEL,
} from "#src/input/constants";
import { createInput } from "#src/input/createInput";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(createInput, () => {
  const POINTER_MOVE = 10;
  const STICK_AXIS = 0.5;

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("moves by the keys held, a pair held against each other cancelling", () => {
    expect.hasAssertions();

    const target = new EventTarget();
    const { readInput } = createInput(target as unknown as Window);
    target.dispatchEvent(Object.assign(new Event("keydown"), { code: KEY_CODE_FORWARD }));
    target.dispatchEvent(Object.assign(new Event("keydown"), { code: KEY_CODE_BACKWARD }));
    target.dispatchEvent(Object.assign(new Event("keydown"), { code: KEY_CODE_RIGHT }));
    vi.stubGlobal("navigator", { getGamepads: () => [] });

    expect({ moveForward: readInput().moveForward, moveRight: readInput().moveRight }).toStrictEqual({
      moveForward: 0,
      moveRight: 1,
    });
  });

  test("turns the look by the pointer's movement while it is locked, once a read", () => {
    expect.hasAssertions();

    const target = new EventTarget();
    const { readInput } = createInput(target as unknown as Window);
    vi.stubGlobal("document", { pointerLockElement: target });
    vi.stubGlobal("navigator", { getGamepads: () => [] });
    target.dispatchEvent(Object.assign(new Event("mousemove"), { movementX: POINTER_MOVE, movementY: 0 }));
    const { lookYaw } = readInput();

    expect({ lookYaw, next: readInput().lookYaw }).toStrictEqual({
      lookYaw: -POINTER_MOVE * MOUSE_LOOK_RADIANS_PER_PIXEL,
      next: 0,
    });
  });

  test("moves by the first gamepad's left stick past its deadzone", () => {
    expect.hasAssertions();

    const target = new EventTarget();
    const { readInput } = createInput(target as unknown as Window);
    vi.stubGlobal("navigator", { getGamepads: () => [{ axes: [STICK_AXIS, -GAMEPAD_STICK_DEADZONE / 2] }] });
    const { moveForward, moveRight } = readInput();

    expect({ moveForward, moveRight }).toStrictEqual({ moveForward: 0, moveRight: STICK_AXIS });
  });
});
