import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { onClickOutside } from "#src/services/emit/onClickOutside";
import { getTestGame, removeTestScene, startTestScene } from "#src/test/fixtures/headlessGame.test";
import { Input } from "phaser";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(onClickOutside, () => {
  const sceneKey = "sceneKey";
  // A square at the origin whose hit area includes its far edge, so twice its size is the nearest point clear of it
  const size = 1;
  const inside = 0;
  const outside = size * 2;
  let scene: SceneWithPlugins;
  let gameObject: GameObjects.Rectangle;

  const createPointer = (id: number) => new Input.Pointer(getTestGame().input, id);
  const press = (pointer: Input.Pointer, position: number) => {
    pointer.x = pointer.y = position;
    scene.input.emit(Input.Events.POINTER_DOWN, pointer);
  };
  const release = (pointer: Input.Pointer, position: number) => {
    pointer.x = pointer.y = position;
    scene.input.emit(Input.Events.POINTER_UP, pointer);
  };

  beforeEach(() => {
    scene = startTestScene(sceneKey);
    gameObject = scene.add.rectangle(0, 0, size, size).setOrigin(0).setInteractive();
  });

  afterEach(() => {
    removeTestScene(sceneKey);
  });

  test("calls the listener with the pointer when it is pressed and released outside", () => {
    expect.hasAssertions();

    const listener = vi.fn();
    const pointer = createPointer(1);
    onClickOutside(gameObject, listener);
    press(pointer, outside);
    release(pointer, outside);

    expect(listener).toHaveBeenCalledExactlyOnceWith(pointer);
  });

  test("ignores a press that starts on the game object", () => {
    expect.hasAssertions();

    const listener = vi.fn();
    const pointer = createPointer(1);
    onClickOutside(gameObject, listener);
    press(pointer, inside);
    release(pointer, outside);

    expect(listener).not.toHaveBeenCalled();
  });

  test("ignores a release on the game object", () => {
    expect.hasAssertions();

    const listener = vi.fn();
    const pointer = createPointer(1);
    onClickOutside(gameObject, listener);
    press(pointer, outside);
    release(pointer, inside);

    expect(listener).not.toHaveBeenCalled();
  });

  test("ignores a game object whose container is hidden", () => {
    expect.hasAssertions();

    const listener = vi.fn();
    const pointer = createPointer(1);
    scene.add.container(0, 0, gameObject).setVisible(false);
    onClickOutside(gameObject, listener);
    press(pointer, outside);
    release(pointer, outside);

    expect(listener).not.toHaveBeenCalled();
  });

  test("does not carry a press whose release never reached the scene into the next click", () => {
    expect.hasAssertions();

    const listener = vi.fn();
    const pointer = createPointer(1);
    onClickOutside(gameObject, listener);
    press(pointer, outside);
    press(pointer, inside);
    release(pointer, outside);

    expect(listener).not.toHaveBeenCalled();
  });

  test("follows each pointer on its own", () => {
    expect.hasAssertions();

    const listener = vi.fn();
    const pointer = createPointer(1);
    const otherPointer = createPointer(2);
    onClickOutside(gameObject, listener);
    press(pointer, outside);
    press(otherPointer, outside);
    release(otherPointer, outside);

    expect(listener).toHaveBeenCalledExactlyOnceWith(otherPointer);
  });

  test("#438 counts a click on another game object covering the pointer", () => {
    expect.hasAssertions();

    const listener = vi.fn();
    const pointer = createPointer(1);
    scene.add.rectangle(outside, outside, size, size).setInteractive();
    onClickOutside(gameObject, listener);
    press(pointer, outside);
    release(pointer, outside);

    expect(listener).toHaveBeenCalledExactlyOnceWith(pointer);
  });

  test("stops listening once stopped", () => {
    expect.hasAssertions();

    const listener = vi.fn();
    const pointer = createPointer(1);
    const stop = onClickOutside(gameObject, listener);
    stop();
    press(pointer, outside);
    release(pointer, outside);

    expect(listener).not.toHaveBeenCalled();
  });
});
