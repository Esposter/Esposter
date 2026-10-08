import {
  GAMEPAD_STICK_DEADZONE,
  KEY_CODE_BACKWARD,
  KEY_CODE_FORWARD,
  KEY_CODE_RIGHT,
  MOUSE_LOOK_RADIANS_PER_PIXEL,
} from "#src/input/constants";
import { createInput } from "#src/input/createInput";
import { describe, expect, test } from "vitest";

// An event target standing in for the window, with the gamepads it reports and the element holding its pointer lock
const createTarget = (gamepads: unknown[] = [], pointerLockElement: unknown = null) =>
  Object.assign(new EventTarget(), { document: { pointerLockElement }, navigator: { getGamepads: () => gamepads } });

describe(createInput, () => {
  const POINTER_MOVE = 10;
  const STICK_AXIS = 0.5;

  test("moves by the keys held, a pair held against each other cancelling", () => {
    expect.hasAssertions();

    const target = createTarget();
    const { readInput } = createInput(target as unknown as Window);
    target.dispatchEvent(Object.assign(new Event("keydown"), { code: KEY_CODE_FORWARD }));
    target.dispatchEvent(Object.assign(new Event("keydown"), { code: KEY_CODE_BACKWARD }));
    target.dispatchEvent(Object.assign(new Event("keydown"), { code: KEY_CODE_RIGHT }));

    expect({ moveForward: readInput(0).moveForward, moveRight: readInput(0).moveRight }).toStrictEqual({
      moveForward: 0,
      moveRight: 1,
    });
  });

  test("lets go of every key held when the target loses focus", () => {
    expect.hasAssertions();

    const target = createTarget();
    const { readInput } = createInput(target as unknown as Window);
    target.dispatchEvent(Object.assign(new Event("keydown"), { code: KEY_CODE_FORWARD }));
    target.dispatchEvent(new Event("blur"));

    expect(readInput(0).moveForward).toBe(0);
  });

  test("hears nothing once disposed", () => {
    expect.hasAssertions();

    const target = createTarget();
    const { dispose, readInput } = createInput(target as unknown as Window);
    dispose();
    target.dispatchEvent(Object.assign(new Event("keydown"), { code: KEY_CODE_FORWARD }));

    expect(readInput(0).moveForward).toBe(0);
  });

  test("turns the look by the pointer's movement while it is locked, once a read", () => {
    expect.hasAssertions();

    const target = createTarget([], true);
    const { readInput } = createInput(target as unknown as Window);
    target.dispatchEvent(Object.assign(new Event("mousemove"), { movementX: POINTER_MOVE, movementY: 0 }));
    const { lookYaw } = readInput(0);

    expect({ lookYaw, next: readInput(0).lookYaw }).toStrictEqual({
      lookYaw: -POINTER_MOVE * MOUSE_LOOK_RADIANS_PER_PIXEL,
      next: 0,
    });
  });

  test("moves by the first gamepad's left stick past its deadzone", () => {
    expect.hasAssertions();

    const target = createTarget([{ axes: [STICK_AXIS, -GAMEPAD_STICK_DEADZONE / 2] }]);
    const { readInput } = createInput(target as unknown as Window);
    const { moveForward, moveRight } = readInput(0);

    expect({ moveForward, moveRight }).toStrictEqual({ moveForward: 0, moveRight: STICK_AXIS });
  });
});
