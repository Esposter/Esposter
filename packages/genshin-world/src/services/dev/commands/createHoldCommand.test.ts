import { DevMoveDirection } from "#src/models/dev/DevMoveDirection";
import { createHoldCommand } from "#src/services/dev/commands/createHoldCommand";
import { createInput, InputAction } from "genshin-engine";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// An event target standing in for the window the input reads, which reports no gamepad and holds no focus
const createTarget = () =>
  Object.assign(new EventTarget(), {
    document: { activeElement: null, pointerLockElement: null },
    navigator: { getGamepads: () => [] },
  });

// A frame clock standing in for the one the session steps: each frame hands its seconds to every listener
const createFrameClock = () => {
  const listeners: ((deltaSeconds: number) => void)[] = [];
  return {
    onFrame: (listener: (deltaSeconds: number) => void) => {
      listeners.push(listener);
    },
    tick: (deltaSeconds: number) => {
      for (const listener of listeners) listener(deltaSeconds);
    },
  };
};

describe(createHoldCommand, () => {
  // Frames of half a second, which add up exactly, so the two seconds of a hold are four frames
  const FRAME_SECONDS = 0.5;
  const FRAME_COUNT = 5;

  beforeEach(() => {
    // The browser's keyboard and mouse events, which a Node suite has no globals for: each keeps the one field the input reads
    vi.stubGlobal(
      "KeyboardEvent",
      class extends Event {
        constructor(type: string, init: { code: string }) {
          super(type);
          Object.assign(this, init);
        }
      },
    );
    vi.stubGlobal(
      "MouseEvent",
      class extends Event {
        constructor(type: string, init: { button: number }) {
          super(type);
          Object.assign(this, init);
        }
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("a hold command holds a control for its seconds", () => {
    expect.hasAssertions();

    const target = createTarget();
    const { readInput } = createInput(target);
    const frameClock = createFrameClock();
    const result = createHoldCommand({ onFrame: frameClock.onFrame, target }).run({
      control: InputAction.Interact,
      seconds: 2,
    });
    const heldAtFrame = Array.from({ length: FRAME_COUNT }, () => {
      const isHeld = readInput(FRAME_SECONDS).heldActions.has(InputAction.Interact);
      frameClock.tick(FRAME_SECONDS);
      return isHeld;
    });

    expect({ heldAtFrame, result }).toStrictEqual({
      heldAtFrame: [true, true, true, true, false],
      result: { ok: true, value: 2 },
    });
  });

  test("a zero hold presses a control once, which the next read sees pressed and not held", () => {
    expect.hasAssertions();

    const target = createTarget();
    const { readInput } = createInput(target);
    createHoldCommand({ onFrame: createFrameClock().onFrame, target }).run({
      control: InputAction.Interact,
      seconds: 0,
    });
    const { heldActions, pressedActions } = readInput(FRAME_SECONDS);

    expect({
      isHeld: heldActions.has(InputAction.Interact),
      isPressed: pressedActions.has(InputAction.Interact),
    }).toStrictEqual({ isHeld: false, isPressed: true });
  });

  test("a mouse button is held as a mouse press, read as a held action like a key", () => {
    expect.hasAssertions();

    const target = createTarget();
    const { readInput } = createInput(target);
    const frameClock = createFrameClock();
    createHoldCommand({ onFrame: frameClock.onFrame, target }).run({ control: InputAction.NormalAttack, seconds: 1 });
    const isHeldBeforeTick = readInput(FRAME_SECONDS).heldActions.has(InputAction.NormalAttack);
    frameClock.tick(1);
    const isHeldAfterTick = readInput(FRAME_SECONDS).heldActions.has(InputAction.NormalAttack);

    expect({ isHeldAfterTick, isHeldBeforeTick }).toStrictEqual({ isHeldAfterTick: false, isHeldBeforeTick: true });
  });

  test("a move direction holds its move key, which the input reads as the move", () => {
    expect.hasAssertions();

    const target = createTarget();
    const { readInput } = createInput(target);
    const frameClock = createFrameClock();
    createHoldCommand({ onFrame: frameClock.onFrame, target }).run({ control: DevMoveDirection.Forward, seconds: 1 });
    const moveForwardBeforeTick = readInput(FRAME_SECONDS).moveForward;
    frameClock.tick(1);
    const moveForwardAfterTick = readInput(FRAME_SECONDS).moveForward;

    expect({ moveForwardAfterTick, moveForwardBeforeTick }).toStrictEqual({
      moveForwardAfterTick: 0,
      moveForwardBeforeTick: 1,
    });
  });

  test("refuses a control that is neither a move direction nor an input action", () => {
    expect.hasAssertions();

    const result = createHoldCommand({ onFrame: createFrameClock().onFrame, target: createTarget() }).run({
      control: "-1",
      seconds: 0,
    });

    expect(result).toStrictEqual({ error: "unknown control -1", ok: false });
  });
});
