import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";

import { onCreate } from "#src/hooks/onCreate";
import { removeTestScene, startTestScene } from "#src/test/fixtures/headlessGame.test";
import { describe, expect, test, vi } from "vitest";

describe(onCreate, () => {
  const sceneKey = "sceneKey";
  const otherSceneKey = "otherSceneKey";

  test("fires listener exactly once during create", () => {
    expect.hasAssertions();

    const listener = vi.fn<(scene: SceneWithPlugins) => void>();
    onCreate(listener, sceneKey);
    startTestScene(sceneKey);

    expect(listener).toHaveBeenCalledTimes(1);

    removeTestScene(sceneKey);
  });

  test("a scene's listener does not fire when another scene starts", () => {
    expect.hasAssertions();

    const listener = vi.fn<(scene: SceneWithPlugins) => void>();
    const otherListener = vi.fn<(scene: SceneWithPlugins) => void>();
    onCreate(listener, sceneKey);
    onCreate(otherListener, otherSceneKey);

    startTestScene(sceneKey);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(otherListener).toHaveBeenCalledTimes(0);

    startTestScene(otherSceneKey);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(otherListener).toHaveBeenCalledTimes(1);

    removeTestScene(sceneKey);
    removeTestScene(otherSceneKey);
  });
});
