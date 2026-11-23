import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { createVirtualJoystick } from "#src/services/input/createVirtualJoystick";
import { getTestGame, removeTestScene, startTestScene } from "#src/test/fixtures/headlessGame.test";
import { Input } from "phaser";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const createPointer = (id: number) => new Input.Pointer(getTestGame().input, id);
const movePointer = (pointer: Input.Pointer, x: number, y: number, isDown = true) => {
  pointer.x = x;
  pointer.y = y;
  pointer.isDown = isDown;
};

describe(createVirtualJoystick, () => {
  const sceneKey = "sceneKey";
  const radius = 10;
  const deadZone = 2;
  // The base sits away from the origin, so an offset read from the screen rather than the world misses it
  const center = 100;
  let scene: SceneWithPlugins;
  let base: GameObjects.Rectangle;
  let thumb: GameObjects.Rectangle;

  const press = (pointer: Input.Pointer, x: number, y: number) => {
    movePointer(pointer, x, y);
    scene.input.emit(Input.Events.POINTER_DOWN, pointer);
  };
  const move = (pointer: Input.Pointer, x: number, y: number, isDown = true) => {
    movePointer(pointer, x, y, isDown);
    scene.input.emit(Input.Events.POINTER_MOVE, pointer);
  };
  const createJoystick = () => createVirtualJoystick(scene, { base, deadZone, radius, thumb });

  beforeEach(() => {
    scene = startTestScene(sceneKey);
    base = scene.add.rectangle(center, center, radius * 2, radius * 2);
    thumb = scene.add.rectangle(0, 0, radius, radius);
  });

  afterEach(() => {
    removeTestScene(sceneKey);
  });

  test("starts with the thumb on its base and no key down", () => {
    expect.hasAssertions();

    const { cursorKeys } = createJoystick();

    expect(thumb.x).toBe(center);
    expect(thumb.y).toBe(center);
    expect(Object.values(cursorKeys).some(({ isDown }) => isDown)).toBe(false);
  });

  test("presses the arrow key of the axis the thumb is further along", () => {
    expect.hasAssertions();

    const { cursorKeys } = createJoystick();
    const pointer = createPointer(1);
    press(pointer, center + deadZone * 2, center + deadZone);

    expect(cursorKeys.right.isDown).toBe(true);
    expect(cursorKeys.down.isDown).toBe(false);

    move(pointer, center + deadZone, center - deadZone * 2);

    expect(cursorKeys.right.isDown).toBe(false);
    expect(cursorKeys.up.isDown).toBe(true);
  });

  test("keeps the thumb within the radius", () => {
    expect.hasAssertions();

    createJoystick();
    const pointer = createPointer(1);
    press(pointer, center, center);
    move(pointer, center - radius * 3, center);

    expect(thumb.x).toBe(center - radius);
    expect(thumb.y).toBe(center);
  });

  test("ignores a press outside the radius", () => {
    expect.hasAssertions();

    const { cursorKeys } = createJoystick();
    press(createPointer(1), center + radius * 2, center);

    expect(cursorKeys.right.isDown).toBe(false);
    expect(thumb.x).toBe(center);
  });

  test("takes a pointer slid onto it while pressed", () => {
    expect.hasAssertions();

    const { cursorKeys } = createJoystick();
    const pointer = createPointer(1);
    press(pointer, center + radius * 2, center);
    move(pointer, center + deadZone * 2, center);

    expect(cursorKeys.right.isDown).toBe(true);
  });

  test("keeps a held joystick from a second pointer", () => {
    expect.hasAssertions();

    const { cursorKeys } = createJoystick();
    press(createPointer(1), center + deadZone * 2, center);
    const otherPointer = createPointer(2);
    press(otherPointer, center - deadZone * 2, center);
    move(otherPointer, center - deadZone * 3, center);

    expect(cursorKeys.right.isDown).toBe(true);
    expect(cursorKeys.left.isDown).toBe(false);
  });

  test("lets go on release", () => {
    expect.hasAssertions();

    const { cursorKeys } = createJoystick();
    const pointer = createPointer(1);
    press(pointer, center + deadZone * 2, center);
    movePointer(pointer, center + deadZone * 2, center, false);
    scene.input.emit(Input.Events.POINTER_UP, pointer);

    expect(cursorKeys.right.isDown).toBe(false);
    expect(thumb.x).toBe(center);
  });

  test("#178 holds the arrow keys' own key codes", () => {
    expect.hasAssertions();

    const { cursorKeys } = createJoystick();

    expect(cursorKeys.down.keyCode).toBe(Input.Keyboard.KeyCodes.DOWN);
    expect(cursorKeys.left.keyCode).toBe(Input.Keyboard.KeyCodes.LEFT);
    expect(cursorKeys.right.keyCode).toBe(Input.Keyboard.KeyCodes.RIGHT);
    expect(cursorKeys.up.keyCode).toBe(Input.Keyboard.KeyCodes.UP);
  });

  test("#8 holds a pointer anywhere within the radius of a scaled base", () => {
    expect.hasAssertions();

    base.setScale(0.5);
    const { cursorKeys } = createJoystick();
    press(createPointer(1), center + radius - 1, center);

    expect(cursorKeys.right.isDown).toBe(true);
  });

  test("#102 reads a zoomed camera's world", () => {
    expect.hasAssertions();

    const zoom = 2;
    const camera = scene.cameras.main.setZoom(zoom);
    camera.preRender();
    base.setPosition(camera.midPoint.x, camera.midPoint.y);
    const { cursorKeys } = createJoystick();
    // On screen the pointer is further than the radius from the base, in the world it is within it
    press(createPointer(1), camera.width / 2 + radius * 1.5, camera.height / 2);

    expect(cursorKeys.right.isDown).toBe(true);
    expect(thumb.x).toBe(base.x + (radius * 1.5) / zoom);
  });

  test("#399 reads a scrolled camera's world", () => {
    expect.hasAssertions();

    const scroll = 1000;
    const camera = scene.cameras.main.setScroll(scroll, scroll);
    camera.preRender();
    base.setPosition(center + scroll, center + scroll);
    const { cursorKeys } = createJoystick();
    press(createPointer(1), center - deadZone * 2, center);

    expect(cursorKeys.left.isDown).toBe(true);
  });

  test("#156 lets go when released off the canvas", () => {
    expect.hasAssertions();

    const { cursorKeys } = createJoystick();
    const pointer = createPointer(1);
    press(pointer, center + deadZone * 2, center);
    movePointer(pointer, -center, -center, false);
    scene.input.emit(Input.Events.POINTER_UP_OUTSIDE, pointer);

    expect(cursorKeys.right.isDown).toBe(false);
    expect(thumb.x).toBe(center);
  });

  test("#160 a released key holds how long it was down", () => {
    expect.hasAssertions();

    vi.useFakeTimers({ toFake: ["performance"] });
    const heldMilliseconds = 100;
    const { cursorKeys } = createJoystick();
    const pointer = createPointer(1);
    press(pointer, center + deadZone * 2, center);
    vi.advanceTimersByTime(heldMilliseconds);
    movePointer(pointer, center + deadZone * 2, center, false);
    scene.input.emit(Input.Events.POINTER_UP, pointer);
    vi.useRealTimers();

    expect(cursorKeys.right.duration).toBe(heldMilliseconds);
  });

  test("#180 lets go of its keys when destroyed after its scene shut down", () => {
    expect.hasAssertions();

    const { cursorKeys, destroy } = createJoystick();
    press(createPointer(1), center + deadZone * 2, center);
    removeTestScene(sceneKey);

    expect(() => {
      destroy();
    }).not.toThrow();
    expect(cursorKeys.right.isDown).toBe(false);
  });

  test("#526 a pointer held at the centre presses no key", () => {
    expect.hasAssertions();

    const { cursorKeys } = createJoystick();
    press(createPointer(1), center, center);

    expect(Object.values(cursorKeys).some(({ isDown }) => isDown)).toBe(false);
  });
});
