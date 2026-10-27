import { TweenSetterMap } from "#src/services/setterMap/global/TweenSetterMap";
import { removeTestScene, startTestScene } from "#src/test/fixtures/headlessGame.test";
import { afterEach, describe, expect, test, vi } from "vitest";
import { TweenSetter } from "#src/models/setterMap/global/TweenSetter";

describe("tweenSetterMap", () => {
  const sceneKey = "sceneKey";

  afterEach(() => {
    removeTestScene(sceneKey);
  });

  test("replaces the running tween rather than running two on the same game object", () => {
    expect.hasAssertions();

    const scene = startTestScene(sceneKey);
    const sprite = scene.add.sprite(0, 0, "");
    const emit = vi.fn<(...args: unknown[]) => void>();
    TweenSetterMap[TweenSetter.Tween](sprite, emit)({ duration: 1, x: 0 });
    TweenSetterMap[TweenSetter.Tween](sprite, emit)({ duration: 1, x: 0.1 });

    expect(scene.tweens.getTweensOf(sprite)).toHaveLength(1);
  });
});
