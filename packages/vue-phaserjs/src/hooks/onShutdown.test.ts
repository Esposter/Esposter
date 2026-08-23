import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";

import { onShutdown } from "#src/hooks/onShutdown";
import { getTestGame, removeTestScene, startTestScene } from "#src/test/fixtures/headlessGame.test";
import { describe, expect, test, vi } from "vitest";

describe(onShutdown, () => {
  const sceneKey = "sceneKey";

  test("fires listener when the scene is stopped", () => {
    expect.hasAssertions();

    const listener = vi.fn<(scene: SceneWithPlugins) => void>();
    onShutdown(listener, sceneKey);
    startTestScene(sceneKey);

    expect(listener).toHaveBeenCalledTimes(0);

    getTestGame().scene.stop(sceneKey);

    expect(listener).toHaveBeenCalledTimes(1);

    removeTestScene(sceneKey);
  });
});
