import { TweenSetter } from "#src/models/setterMap/global/TweenSetter";
import { TweenSetterMap } from "#src/services/setterMap/global/TweenSetterMap";
import { removeTestScene, startTestScene } from "#src/test/fixtures/headlessGame.test";
import { afterEach, describe, expect, test, vi } from "vitest";

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

  test("a tween whose game object is destroyed still completes, so its owner's ref clears and its onComplete runs", () => {
    expect.hasAssertions();

    const scene = startTestScene(sceneKey);
    const sprite = scene.add.sprite(0, 0, "");
    const emit = vi.fn<(...args: unknown[]) => void>();
    const onComplete = vi.fn<(...args: unknown[]) => void>();
    TweenSetterMap[TweenSetter.Tween](sprite, emit)({ duration: 1, onComplete, x: 0 });
    sprite.destroy();
    for (const tween of scene.tweens.getTweensOf(sprite)) tween.update(0);

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledExactlyOnceWith("update:tween", undefined);
  });
});
