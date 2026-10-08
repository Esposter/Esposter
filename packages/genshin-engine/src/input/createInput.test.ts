import {
  GAMEPAD_BUTTONS,
  GAMEPAD_STICK_DEADZONE,
  KEY_CODE_BACKWARD,
  KEY_CODE_FORWARD,
  KEY_CODE_RIGHT,
  MOUSE_LOOK_RADIANS_PER_PIXEL,
} from "#src/input/constants";
import { createInput } from "#src/input/createInput";
import { GamepadButton } from "#src/models/input/GamepadButton";
import { InputAction } from "#src/models/input/InputAction";
import { describe, expect, test } from "vitest";

// An event target standing in for the window, with the gamepads it reports, the element holding its pointer lock and
// The element holding its focus
const createTarget = (gamepads: unknown[] = [], pointerLockElement: unknown = null, activeElement: unknown = null) =>
  Object.assign(new EventTarget(), {
    document: { activeElement, pointerLockElement },
    navigator: { getGamepads: () => gamepads },
  });

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

  test("moves by the touch controls: the key a button holds and the on-screen stick", () => {
    expect.hasAssertions();

    const input = createInput(createTarget() as unknown as Window);
    input.press(KEY_CODE_FORWARD);
    input.setTouchStick(STICK_AXIS, 0);
    const { moveForward, moveRight } = input.readInput(0);

    expect({ moveForward, moveRight }).toStrictEqual({ moveForward: 1, moveRight: STICK_AXIS });
  });

  test("presses an action for the one read after its key goes down, and holds it while the key stays down", () => {
    expect.hasAssertions();

    const target = createTarget();
    const { readInput } = createInput(target as unknown as Window);
    target.dispatchEvent(Object.assign(new Event("keydown"), { code: "KeyM" }));
    const pressedActions = new Set(readInput(0).pressedActions);
    const { heldActions, pressedActions: nextPressedActions } = readInput(0);

    expect({ heldActions, nextPressedActions, pressedActions }).toStrictEqual({
      heldActions: new Set([InputAction.OpenMap]),
      nextPressedActions: new Set(),
      pressedActions: new Set([InputAction.OpenMap]),
    });
  });

  test("presses a gamepad bumper's shortcut alone when a face button goes down under it", () => {
    expect.hasAssertions();

    const pressedButtons = [GamepadButton.LeftBumper];
    const target = createTarget([
      {
        axes: [],
        get buttons() {
          return GAMEPAD_BUTTONS.map((button) => ({ pressed: pressedButtons.includes(button) }));
        },
      },
    ]);
    const { readInput } = createInput(target as unknown as Window);
    readInput(0);
    pressedButtons.push(GamepadButton.FaceRight);

    expect(readInput(0).pressedActions).toStrictEqual(new Set([InputAction.QuickUseGadget]));
  });

  test("zooms by the wheel's notches since the last read, however far each scrolls", () => {
    expect.hasAssertions();

    const target = createTarget();
    const { readInput } = createInput(target as unknown as Window);
    target.dispatchEvent(Object.assign(new Event("wheel"), { deltaY: POINTER_MOVE }));
    target.dispatchEvent(Object.assign(new Event("wheel"), { deltaY: POINTER_MOVE }));
    const { zoomSteps } = readInput(0);

    expect({ next: readInput(0).zoomSteps, zoomSteps }).toStrictEqual({ next: 0, zoomSteps: 2 });
  });

  test("leaves a key typed into a field to the field", () => {
    expect.hasAssertions();

    const target = createTarget([], null, { matches: () => true });
    const { readInput } = createInput(target as unknown as Window);
    const event = Object.assign(new Event("keydown", { cancelable: true }), { code: "KeyM" });
    target.dispatchEvent(event);

    expect({ isDefaultPrevented: event.defaultPrevented, pressedActions: readInput(0).pressedActions }).toStrictEqual({
      isDefaultPrevented: false,
      pressedActions: new Set(),
    });
  });

  test("moves by the first gamepad's left stick past its deadzone", () => {
    expect.hasAssertions();

    const target = createTarget([{ axes: [STICK_AXIS, -GAMEPAD_STICK_DEADZONE / 2], buttons: [] }]);
    const { readInput } = createInput(target as unknown as Window);
    const { moveForward, moveRight } = readInput(0);

    expect({ moveForward, moveRight }).toStrictEqual({ moveForward: 0, moveRight: STICK_AXIS });
  });
});
