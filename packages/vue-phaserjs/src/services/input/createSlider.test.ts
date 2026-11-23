import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { createSlider } from "#src/services/input/createSlider";
import { getTestGame, removeTestScene, startTestScene } from "#src/test/fixtures/headlessGame.test";
import { Input } from "phaser";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(createSlider, () => {
  const sceneKey = "sceneKey";
  const length = 100;
  const start = { x: 0, y: 0 };
  const end = { x: length, y: 0 };
  let scene: SceneWithPlugins;
  let thumb: GameObjects.Rectangle;

  const drag = (dragX: number, dragY: number) => {
    thumb.emit(Input.Events.GAMEOBJECT_DRAG, new Input.Pointer(getTestGame().input, 1), dragX, dragY);
  };

  beforeEach(() => {
    scene = startTestScene(sceneKey);
    thumb = scene.add.rectangle(0, 0, 1, 1);
  });

  afterEach(() => {
    removeTestScene(sceneKey);
  });

  test("places the thumb at its value along the segment", () => {
    expect.hasAssertions();

    createSlider(thumb, { end, onValueChange: vi.fn<(value: number) => void>(), start, value: 0.5 });

    expect(thumb.x).toBe(length / 2);
    expect(thumb.y).toBe(0);
  });

  test("reports the value a drag projects onto the segment", () => {
    expect.hasAssertions();

    const onValueChange = vi.fn<(value: number) => void>();
    const slider = createSlider(thumb, { end, onValueChange, start, value: 0 });
    drag(length / 4, length);

    expect(slider.value).toBe(0.25);
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(0.25);
    expect(thumb.x).toBe(length / 4);
    expect(thumb.y).toBe(0);
  });

  test("runs from start to end when the end is before the start", () => {
    expect.hasAssertions();

    const slider = createSlider(thumb, {
      end: start,
      onValueChange: vi.fn<(value: number) => void>(),
      start: end,
      value: 0,
    });
    drag(length / 4, 0);

    expect(slider.value).toBe(0.75);
    expect(thumb.x).toBe(length / 4);
  });

  test("follows a diagonal segment", () => {
    expect.hasAssertions();

    const slider = createSlider(thumb, {
      end: { x: length, y: length },
      onValueChange: vi.fn<(value: number) => void>(),
      start,
      value: 0,
    });
    drag(length, 0);

    expect(slider.value).toBe(0.5);
    expect(thumb.x).toBe(length / 2);
    expect(thumb.y).toBe(length / 2);
  });

  test("clamps a drag past either end", () => {
    expect.hasAssertions();

    const slider = createSlider(thumb, { end, onValueChange: vi.fn<(value: number) => void>(), start, value: 0.5 });
    drag(length * 2, 0);

    expect(slider.value).toBe(1);

    drag(-length, 0);

    expect(slider.value).toBe(0);
  });

  test("keeps its value on a drag across a segment with no length", () => {
    expect.hasAssertions();

    const onValueChange = vi.fn<(value: number) => void>();
    const slider = createSlider(thumb, { end: start, onValueChange, start, value: 0.5 });
    drag(length, length);

    expect(slider.value).toBe(0.5);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("moves the thumb for a value set through it without reporting it", () => {
    expect.hasAssertions();

    const onValueChange = vi.fn<(value: number) => void>();
    const slider = createSlider(thumb, { end, onValueChange, start, value: 0 });
    slider.value = 1;

    expect(thumb.x).toBe(length);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("ignores a drag once destroyed", () => {
    expect.hasAssertions();

    const onValueChange = vi.fn<(value: number) => void>();
    const slider = createSlider(thumb, { end, onValueChange, start, value: 0 });
    slider.destroy();
    drag(length, 0);

    expect(slider.value).toBe(0);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
